/**
 * Test Fixtures and Sample Data
 * Used for testing RAG, Conversation, and Integration
 */

// Sample Documents for RAG Testing
const sampleDocuments = {
  billing: {
    id: 'doc_billing_101',
    title: 'Billing and Pricing Guide',
    content: `
Billing and Pricing Guide

## Subscription Plans

### Standard Plan - $9.99/month
- Up to 100 conversations per month
- Basic analytics dashboard
- Email support
- Community forum access

### Pro Plan - $19.99/month
- Unlimited conversations
- Advanced analytics with sentiment tracking
- Priority email and chat support
- API access
- Custom integrations

### Enterprise Plan - Custom pricing
- Dedicated support
- Custom model training
- White-label options
- SLA guarantees
- On-premise deployment

## Payment Methods

We accept the following payment methods:
- All major credit cards (Visa, Mastercard, American Express)
- PayPal
- Bank transfers (for annual plans)
- Purchase orders (Enterprise only)

## Billing FAQ

Q: When will I be charged?
A: You will be charged on the same day each month as your subscription date.

Q: Can I change my plan?
A: Yes, you can upgrade or downgrade at any time. Changes take effect on your next billing cycle.

Q: What if I need to cancel?
A: You can cancel anytime. Your access continues until the end of your current billing period.

## Refund Policy

We offer a 30-day money-back guarantee for all plans. If you're not satisfied, contact support for a full refund.
    `,
    source: 'help/billing.md'
  },

  account: {
    id: 'doc_account_101',
    title: 'Account Management',
    content: `
Account Management Guide

## Creating Your Account

1. Visit www.example.com/signup
2. Enter your email address
3. Create a strong password
4. Accept terms of service
5. Verify your email (check your inbox)
6. Complete your profile

## Changing Your Password

1. Log in to your account
2. Click Settings (top right menu)
3. Select "Security" from the left menu
4. Click "Change Password"
5. Enter your current password
6. Enter your new password twice
7. Click "Update Password"

## Recovery: Forgot Password

If you can't remember your password:
1. Go to the login page
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for a reset link
5. Click the link (valid for 24 hours)
6. Enter your new password
7. You can now log in

## Two-Factor Authentication (2FA)

For enhanced security, we recommend enabling 2FA:
1. Go to Settings > Security
2. Click "Enable 2FA"
3. Select your method:
   - Google Authenticator
   - Microsoft Authenticator
   - SMS (text message)
4. Follow the setup wizard
5. Save backup codes in a safe place

## Account Deletion

To permanently delete your account:
1. Go to Settings > Account
2. Scroll to the bottom
3. Click "Delete Account"
4. Confirm your password
5. Choose data export option
6. Confirm deletion (irreversible)

Note: You have 30 days to contact support to recover a deleted account.
    `,
    source: 'help/account.md'
  },

  technical: {
    id: 'doc_technical_101',
    title: 'Technical Documentation',
    content: `
Technical Documentation

## API Overview

Our REST API allows programmatic access to:
- Create and manage conversations
- Retrieve conversation history
- Analyze sentiment and emotions
- Access analytics data
- Manage user profiles

## Authentication

Use API keys for authentication:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.example.com/v1/conversations
\`\`\`

## Creating a Conversation

POST /v1/conversations
\`\`\`json
{
  "userId": "user_123",
  "metadata": {
    "platform": "web",
    "language": "en"
  }
}
\`\`\`

## Sending a Message

POST /v1/conversations/{conversationId}/messages
\`\`\`json
{
  "role": "user",
  "content": "What are your hours?",
  "metadata": {
    "device": "mobile"
  }
}
\`\`\`

## Webhook Events

We send webhooks for:
- conversation.created
- conversation.message_added
- conversation.emotion_detected
- conversation.ended
- user.profile_updated

## Rate Limits

- Standard: 100 requests/minute
- Pro: 1,000 requests/minute
- Enterprise: Custom limits

## Status Codes

- 200: Success
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 429: Rate limit exceeded
- 500: Server error
    `,
    source: 'docs/api.md'
  }
};

// Sample FAQs for Testing
const sampleFAQs = [
  {
    question: 'How much does your service cost?',
    answer: 'We offer three plans: Standard ($9.99/month), Pro ($19.99/month), and Enterprise (custom pricing). All plans come with a 14-day free trial.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial for all plans. No credit card required. You can explore all features before deciding.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. You can cancel your subscription anytime, and access continues until the end of your billing period.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for annual plans.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all plans. If unsatisfied, just contact support.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the link sent to your inbox.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use enterprise-grade encryption, regular security audits, and comply with GDPR and CCPA.'
  },
  {
    question: 'Do you offer API access?',
    answer: 'Yes, API access is available on Pro and Enterprise plans. Full documentation is available in your dashboard.'
  }
];

// Sample Conversations for Testing
const sampleConversations = [
  {
    userId: 'customer_001',
    messages: [
      { role: 'user', content: 'Hi! I am interested in your service but I have some questions?' },
      { role: 'user', content: 'How much does it cost?' },
      { role: 'user', content: 'Is there a free trial available?' },
      { role: 'user', content: 'Great! I am excited to try it out!' }
    ],
    expectedEmotions: ['neutral', 'neutral', 'neutral', 'excited']
  },
  {
    userId: 'customer_002',
    messages: [
      { role: 'user', content: 'I am so frustrated with my billing!' },
      { role: 'user', content: 'I was charged twice last month' },
      { role: 'user', content: 'This is completely unacceptable!' },
      { role: 'user', content: 'I demand a refund immediately' }
    ],
    expectedEmotions: ['angry', 'angry', 'angry', 'angry']
  },
  {
    userId: 'customer_003',
    messages: [
      { role: 'user', content: 'I don\'t understand how to use the API' },
      { role: 'user', content: 'The documentation is confusing' },
      { role: 'user', content: 'Can you explain the authentication process?' },
      { role: 'user', content: 'Oh, I see now! That makes sense!' }
    ],
    expectedEmotions: ['confused', 'confused', 'confused', 'happy']
  },
  {
    userId: 'customer_004',
    messages: [
      { role: 'user', content: 'I am so sad because the service is shutting down in my country' },
      { role: 'user', content: 'I loved using your product' },
      { role: 'user', content: 'I will miss it so much' }
    ],
    expectedEmotions: ['sad', 'sad', 'sad']
  },
  {
    userId: 'customer_005',
    messages: [
      { role: 'user', content: 'I am absolutely thrilled with your service!' },
      { role: 'user', content: 'The emotion detection feature is amazing!' },
      { role: 'user', content: 'I love how it understands my feelings!' },
      { role: 'user', content: 'This is the best chatbot I have ever used!' }
    ],
    expectedEmotions: ['excited', 'happy', 'happy', 'happy']
  }
];

// Sample Customer Profiles for Testing
const sampleProfiles = {
  customer_001: {
    userId: 'customer_001',
    conversationCount: 3,
    preferredTopics: ['pricing', 'features', 'trial'],
    language: 'en',
    communicationStyle: 'casual',
    averageSatisfaction: 0.85
  },
  customer_002: {
    userId: 'customer_002',
    conversationCount: 5,
    preferredTopics: ['billing', 'refunds', 'complaints'],
    language: 'en',
    communicationStyle: 'formal',
    averageSatisfaction: 0.40,
    notes: 'Frequent issues with billing, needs escalation priority'
  },
  customer_003: {
    userId: 'customer_003',
    conversationCount: 8,
    preferredTopics: ['api', 'technical', 'integration'],
    language: 'en',
    communicationStyle: 'technical',
    averageSatisfaction: 0.90,
    notes: 'Developer customer, API access enabled'
  },
  customer_004: {
    userId: 'customer_004',
    conversationCount: 2,
    preferredTopics: ['product-updates', 'service-status'],
    language: 'en',
    communicationStyle: 'friendly',
    averageSatisfaction: 0.75
  }
};

// Testing Utilities
const testingUtilities = {
  /**
   * Create a mock conversation object
   */
  createMockConversation: (userId, messages = []) => {
    return {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      messages: messages,
      context: {
        sentiment: 'neutral',
        emotionTrajectory: [],
        subtopics: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  /**
   * Create a mock message object
   */
  createMockMessage: (role, content, emotion = 'neutral') => {
    return {
      role: role,
      content: content,
      timestamp: Date.now(),
      emotion: {
        primary: emotion,
        scores: {
          happy: Math.random(),
          sad: Math.random(),
          angry: Math.random(),
          confused: Math.random(),
          excited: Math.random()
        },
        confidence: Math.random()
      },
      entities: {
        names: [],
        locations: [],
        organizations: [],
        topics: [],
        timestamps: []
      },
      keywords: []
    };
  },

  /**
   * Create mock emotion scores
   */
  createMockEmotionScores: (dominantEmotion = 'happy') => {
    const scores = {
      happy: 0.1,
      sad: 0.1,
      angry: 0.1,
      confused: 0.1,
      excited: 0.1
    };
    scores[dominantEmotion] = 0.7;
    return scores;
  },

  /**
   * Verify test data consistency
   */
  validateTestData: () => {
    const errors = [];
    
    // Check documents
    Object.values(sampleDocuments).forEach(doc => {
      if (!doc.id) errors.push('Document missing ID');
      if (!doc.content) errors.push('Document missing content');
      if (!doc.source) errors.push('Document missing source');
    });

    // Check FAQs
    sampleFAQs.forEach((faq, index) => {
      if (!faq.question) errors.push(`FAQ ${index} missing question`);
      if (!faq.answer) errors.push(`FAQ ${index} missing answer`);
    });

    // Check conversations
    Object.values(sampleConversations).forEach(conv => {
      if (!conv.userId) errors.push('Conversation missing userId');
      if (!Array.isArray(conv.messages)) errors.push('Conversation missing messages');
    });

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
};

// Export all test fixtures
module.exports = {
  sampleDocuments,
  sampleFAQs,
  sampleConversations,
  sampleProfiles,
  testingUtilities
};

// Useful: Test data summary
if (require.main === module) {
  console.log('📊 Test Fixtures Summary\n');
  console.log(`✓ Documents: ${Object.keys(sampleDocuments).length}`);
  console.log(`✓ FAQs: ${sampleFAQs.length}`);
  console.log(`✓ Sample Conversations: ${sampleConversations.length}`);
  console.log(`✓ Customer Profiles: ${Object.keys(sampleProfiles).length}`);
  
  const validation = testingUtilities.validateTestData();
  if (validation.valid) {
    console.log(`\n✅ All test data is valid and consistent!`);
  } else {
    console.log(`\n❌ Validation errors found:`);
    validation.errors.forEach(err => console.log(`  - ${err}`));
  }
}
