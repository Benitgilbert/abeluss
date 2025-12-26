import React, { useState } from 'react';
import '../styles/LegalPages.css'; // Reuse container/title styles
import '../styles/FAQ.css'; // Specific FAQ styles

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 3-5 business days within the country. International shipping can take 7-14 business days depending on the destination."
        },
        {
            question: "What is your return policy?",
            answer: "We accept returns within 30 days of purchase. The item must be unused and in its original packaging. Please contact our support team to initiate a return."
        },
        {
            question: "Can I track my order?",
            answer: "Yes, once your order is shipped, you will receive a tracking number via email. You can also use the 'Track Order' link in the footer to check your status."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Yes, we ship to most countries worldwide. Shipping costs and times vary based on location."
        },
        {
            question: "How can I contact customer support?",
            answer: "You can reach our customer support team via email at support@impressa.com or by calling 1-800-IMPRESSA during business hours."
        }
    ];

    return (
        <div className="legal-container">
            <h1 className="legal-title">Frequently Asked Questions</h1>
            <div className="faq-content">
                {faqs.map((faq, index) => (
                    <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                        <button className="faq-question" onClick={() => toggleAccordion(index)}>
                            {faq.question}
                            <span className="faq-icon">{activeIndex === index ? '-' : '+'}</span>
                        </button>
                        <div className="faq-answer">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
