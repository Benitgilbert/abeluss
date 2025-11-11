# MTN Mobile Money (MoMo) Payment Integration

## Overview

This document describes the MTN Mobile Money payment integration for the Impressa e-commerce platform. The integration allows customers to pay for orders using MTN Mobile Money in Rwanda.

## Features

- ✅ Payment initiation from customer's mobile money account
- ✅ Real-time payment status checking
- ✅ Webhook callback handling for automatic payment confirmation
- ✅ Phone number validation
- ✅ Account holder verification
- ✅ Admin balance checking
- ✅ Comprehensive error handling and logging
- ✅ Support for both sandbox and production environments

## Setup

### 1. Get MTN MoMo Credentials

1. Visit [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. Create an account and subscribe to Collections API
3. Generate your API credentials:
   - **Subscription Key** (Ocp-Apim-Subscription-Key)
   - **API User** (UUID)
   - **API Key**

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# MTN Mobile Money Configuration
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_SUBSCRIPTION_KEY=your-subscription-key
MTN_MOMO_API_USER=your-api-user-uuid
MTN_MOMO_API_KEY=your-api-key
MTN_MOMO_CALLBACK_URL=http://localhost:5000/api/payments/mtn/webhook
```

For production:
```env
MTN_MOMO_ENVIRONMENT=production
MTN_MOMO_BASE_URL=https://momodeveloper.mtn.com
```

## API Endpoints

### 1. Initiate Payment

**POST** `/api/payments/mtn/initiate`

Initiates a payment request to the customer's mobile money account.

**Request Body:**
```json
{
  "orderId": "a1b2c3d4e5f6",
  "phoneNumber": "250788123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully. Please check your phone to complete the payment.",
  "data": {
    "orderId": "a1b2c3d4e5f6",
    "transactionId": "uuid-v4-transaction-id",
    "amount": 25000,
    "currency": "RWF",
    "status": "PENDING"
  }
}
```

### 2. Check Payment Status

**GET** `/api/payments/mtn/status/:orderId`

Checks the current status of a payment.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "a1b2c3d4e5f6",
    "transactionId": "uuid-v4-transaction-id",
    "status": "SUCCESSFUL",
    "amount": "25000",
    "currency": "RWF",
    "paidAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Values:**
- `PENDING` - Payment initiated, waiting for customer confirmation
- `SUCCESSFUL` - Payment completed successfully
- `FAILED` - Payment failed or was declined

### 3. Verify Account

**POST** `/api/payments/mtn/verify-account`

Verifies if a phone number has an active MTN MoMo account.

**Request Body:**
```json
{
  "phoneNumber": "250788123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "250788123456",
    "isActive": true,
    "canReceivePayments": true
  }
}
```

### 4. Webhook Callback

**POST** `/api/payments/mtn/webhook`

Receives payment status updates from MTN MoMo.

**Webhook Payload:**
```json
{
  "referenceId": "uuid-v4-transaction-id",
  "externalId": "a1b2c3d4e5f6",
  "status": "SUCCESSFUL"
}
```

### 5. Get Balance (Admin Only)

**GET** `/api/payments/mtn/balance`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availableBalance": "1000000",
    "currency": "RWF"
  }
}
```

## Payment Flow

### Customer Journey

1. **Create Order**: Customer completes checkout and creates an order
2. **Initiate Payment**: Frontend calls `/api/payments/mtn/initiate` with orderId and phoneNumber
3. **Customer Receives Prompt**: Customer gets a USSD prompt on their phone to confirm payment
4. **Customer Confirms**: Customer enters PIN to complete payment
5. **Status Update**: 
   - **Option A**: Frontend polls `/api/payments/mtn/status/:orderId` every 5 seconds
   - **Option B**: Backend receives webhook callback automatically
6. **Order Processing**: On successful payment, order status changes to "processing"

### Backend Flow

```
┌─────────────────┐
│ Initiate Payment│
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Request to MTN API  │
│ (requestToPay)      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Save transaction ID │
│ to Order model      │
└────────┬────────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
    ┌─────────┐      ┌──────────┐      ┌──────────┐
    │ Polling │      │ Webhook  │      │ Customer │
    │ Status  │      │ Callback │      │ Action   │
    └────┬────┘      └─────┬────┘      └────┬─────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Update Order    │
                  │ - Status        │
                  │ - Payment info  │
                  └─────────────────┘
```

## Phone Number Format

Rwanda phone numbers must be in the format: `250XXXXXXXXX`

Examples:
- ✅ `250788123456`
- ✅ `250722123456`
- ❌ `0788123456` (missing country code)
- ❌ `+250788123456` (plus sign not allowed)
- ❌ `250 788 123 456` (spaces not allowed)

The system will automatically strip spaces, dashes, and parentheses from input.

## Error Handling

### Common Errors

1. **Invalid Phone Number**
   ```json
   {
     "success": false,
     "message": "Invalid phone number format. Use format: 250XXXXXXXXX"
   }
   ```

2. **Order Not Found**
   ```json
   {
     "success": false,
     "message": "Order not found"
   }
   ```

3. **Order Already Paid**
   ```json
   {
     "success": false,
     "message": "Order has already been paid"
   }
   ```

4. **Pending Payment Exists**
   ```json
   {
     "success": false,
     "message": "A payment is already pending for this order",
     "transactionId": "uuid-v4-transaction-id"
   }
   ```

5. **Authentication Failed**
   ```json
   {
     "success": false,
     "message": "Failed to authenticate with MTN MoMo"
   }
   ```

## Testing

### Sandbox Testing

MTN provides a sandbox environment for testing. Use the sandbox credentials and test phone numbers:

1. **Test Phone Numbers** (provided by MTN in sandbox)
   - Success: `46733123450` (EU format for sandbox)
   - Failure: `46733123451`

2. **Test Flow**:
   ```bash
   # 1. Create an order (via checkout)
   POST /api/checkout/order
   
   # 2. Initiate payment
   POST /api/payments/mtn/initiate
   {
     "orderId": "generated-order-id",
     "phoneNumber": "250788123456"
   }
   
   # 3. Check status
   GET /api/payments/mtn/status/generated-order-id
   
   # 4. Verify account (optional)
   POST /api/payments/mtn/verify-account
   {
     "phoneNumber": "250788123456"
   }
   ```

### Production Testing

1. Start with small amounts
2. Test with real phone numbers
3. Verify webhook callbacks are received
4. Monitor logs for any issues

## Security Considerations

1. **Webhook Validation**: In production, implement proper webhook signature validation
2. **SSL/TLS**: Always use HTTPS in production for webhook callbacks
3. **Rate Limiting**: Implement rate limiting on payment initiation endpoints
4. **Idempotency**: The system prevents duplicate payments for the same order
5. **Logging**: All payment operations are logged with sensitive data redacted

## Monitoring

### Key Metrics to Monitor

1. **Payment Success Rate**: Track SUCCESSFUL vs FAILED transactions
2. **Payment Duration**: Time from initiation to completion
3. **API Response Times**: Monitor MTN MoMo API latency
4. **Webhook Delivery**: Ensure webhooks are received and processed
5. **Error Rates**: Track authentication failures, network errors, etc.

### Log Examples

```javascript
// Payment initiated
{
  "level": "info",
  "msg": "MTN MoMo payment initiated",
  "orderId": "a1b2c3d4e5f6",
  "transactionId": "uuid-v4",
  "amount": 25000
}

// Payment successful
{
  "level": "info",
  "msg": "Payment successful",
  "orderId": "a1b2c3d4e5f6",
  "transactionId": "uuid-v4"
}

// Payment failed
{
  "level": "warn",
  "msg": "Payment failed",
  "orderId": "a1b2c3d4e5f6",
  "transactionId": "uuid-v4",
  "reason": "Insufficient balance"
}
```

## Frontend Integration Example

```javascript
// 1. Initiate payment after order creation
async function initiatePayment(orderId, phoneNumber) {
  try {
    const response = await fetch('/api/payments/mtn/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, phoneNumber }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show message to user
      alert('Please check your phone to complete payment');
      
      // Start polling for status
      pollPaymentStatus(orderId);
    }
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
}

// 2. Poll payment status
async function pollPaymentStatus(orderId) {
  const maxAttempts = 60; // 5 minutes (60 * 5 seconds)
  let attempts = 0;
  
  const interval = setInterval(async () => {
    attempts++;
    
    try {
      const response = await fetch(`/api/payments/mtn/status/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        const status = data.data.status;
        
        if (status === 'SUCCESSFUL') {
          clearInterval(interval);
          // Redirect to success page
          window.location.href = `/order-success/${orderId}`;
        } else if (status === 'FAILED') {
          clearInterval(interval);
          // Show error message
          alert('Payment failed. Please try again.');
        }
      }
      
      // Stop after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        alert('Payment timeout. Please check your order status later.');
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  }, 5000); // Check every 5 seconds
}

// 3. Verify account before payment (optional)
async function verifyAccount(phoneNumber) {
  try {
    const response = await fetch('/api/payments/mtn/verify-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });
    
    const data = await response.json();
    
    if (!data.data.isActive) {
      alert('This phone number is not registered for MTN Mobile Money');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Account verification failed:', error);
    return false;
  }
}
```

## Troubleshooting

### Issue: Authentication Failed

**Solution**: Verify your credentials in `.env` file:
- Check `MTN_MOMO_SUBSCRIPTION_KEY`
- Check `MTN_MOMO_API_USER` (must be a valid UUID)
- Check `MTN_MOMO_API_KEY`

### Issue: Transaction Not Found

**Solution**: 
- Wait a few seconds after initiating payment before checking status
- Verify the transaction ID is correct
- Check if payment was actually initiated (check logs)

### Issue: Webhook Not Received

**Solution**:
- Ensure your callback URL is publicly accessible
- Use ngrok or similar for local testing
- Check firewall settings
- Verify webhook URL in MTN developer portal

### Issue: Payment Stuck in PENDING

**Solution**:
- Customer may not have completed payment on their phone
- Check if customer has sufficient balance
- Verify network connectivity
- Check MTN MoMo service status

## References

- [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
- [Collections API Documentation](https://momodeveloper.mtn.com/docs/services/collection/)
- [API Reference](https://momodeveloper.mtn.com/api-documentation/api-description/)

## Support

For issues or questions:
1. Check logs in `logs/` directory
2. Review MTN MoMo dashboard for transaction details
3. Contact MTN MoMo support for API-related issues
