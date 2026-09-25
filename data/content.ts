export const articles: Record<
  string,
  { title: string; intro: string; sections: [string, string][] }
> = {
  about: {
    title: 'Good things deserve another chapter.',
    intro:
      'Shopper is a portfolio marketplace built around thoughtful buying, useful things and human connections.',
    sections: [
      [
        'A fresh perspective',
        'We believe the best find is often something that already has a story. Shopper makes it easy to discover, buy and pass on pre-loved things.',
      ],
      [
        'A local demo, with a bigger idea',
        'This application demonstrates a Swiss marketplace experience. Listings, people, ratings and transactions are sample data. Shopper is not operating as a real marketplace business.',
      ],
    ],
  },
  'how-it-works': {
    title: 'A little less new. A lot more possibility.',
    intro: 'Find something you love, or find a new home for something you’ve loved.',
    sections: [
      [
        'Discover your next favourite',
        'Browse categories, narrow down by price and condition, and save the things that catch your eye. Ask the seller a question before committing.',
      ],
      [
        'Make it yours',
        'Buy at a fixed price, send an offer, or place a bid. Demo checkout creates an order without charging money.',
      ],
      [
        'Pass it on',
        'Photograph your item, describe its condition honestly, set a fair price and choose delivery or pickup. Manage everything from your account.',
      ],
    ],
  },
  fees: {
    title: 'Simple, clear demo pricing.',
    intro: 'There are no actual charges in this application.',
    sections: [
      [
        'Listing an item',
        'Creating and publishing a demo listing is free. Promotion is a simulated flag, with no billing.',
      ],
      [
        'Buying and delivery',
        'The demo adds CHF 7.90 per order for delivery, or CHF 0 for pickup. HELLO10 applies a simulated 10% item discount.',
      ],
      [
        'Payment processing',
        'No payment service is connected. The amounts shown are used to demonstrate order calculations, not commercial terms.',
      ],
    ],
  },
  trust: {
    title: 'Good finds start with trust.',
    intro: 'A few thoughtful checks make buying and selling feel better.',
    sections: [
      [
        'Keep the conversation together',
        'Ask questions through marketplace messages. Be cautious of requests to move payment elsewhere or share authentication codes.',
      ],
      [
        'Know what you’re buying',
        'Read the description, inspect photos and ask about condition, included accessories and collection arrangements.',
      ],
      [
        'Let us know when something feels wrong',
        'Use Report listing or the report page to create a record in the demo moderation queue. Verification badges in this demo are sample data.',
      ],
    ],
  },
  'buyer-protection': {
    title: 'A little more peace of mind.',
    intro:
      'The demo illustrates a buyer-support workflow; it does not provide actual insurance, escrow or purchase protection.',
    sections: [
      [
        'Before you buy',
        'Check the description, seller profile and delivery details. Keep questions in the listing conversation.',
      ],
      [
        'If something isn’t right',
        'Open the order in Purchases and choose Request return or Open dispute. Your request is saved for administrator review.',
      ],
      [
        'A clear record',
        'Order details keep the item, amount, delivery address and mock payment method together. No physical purchases or real refunds occur.',
      ],
    ],
  },
  'seller-protection': {
    title: 'Give it a new home, with confidence.',
    intro: 'Clear descriptions and good communication make a good beginning.',
    sections: [
      [
        'Tell the full story',
        'Describe signs of use, what is included, and how collection or delivery works.',
      ],
      [
        'Keep a record',
        'Use marketplace messages to agree on details. In a real sale, retain shipment tracking and item-condition records.',
      ],
      [
        'Demo support',
        'Reports and disputes are stored locally and can be reviewed in the admin area. This demo does not provide legal guarantees or a real protection programme.',
      ],
    ],
  },
  terms: {
    title: 'Demo terms of use',
    intro:
      'This is a local portfolio application, not a commercial marketplace. Updated September 2026.',
    sections: [
      [
        'Demonstration only',
        'All seeded listings, users, ratings and transactions are fictional demonstrations. Do not rely on availability, seller claims or delivery estimates as real offers.',
      ],
      [
        'Using the application',
        'Use sample information. Do not enter sensitive personal, financial or confidential data. Do not use the demo to conduct actual commerce.',
      ],
      [
        'No real fulfilment',
        'Mock payment confirmations do not create a real purchase. No payment is taken, shipment arranged, insurance provided or refund issued.',
      ],
    ],
  },
  privacy: {
    title: 'Your data in this demo',
    intro: 'A transparent view of what the local application stores.',
    sections: [
      [
        'Local database',
        'Accounts, listings, orders, addresses, conversations and marketplace interactions are stored in a local SQLite database. Passwords are hashed. Card numbers and bank credentials are not collected.',
      ],
      [
        'Browser storage',
        'The browser stores draft listings, recently viewed items, searches, follow preferences and display settings. A signed HTTP-only cookie identifies a signed-in demo account.',
      ],
      [
        'External images',
        'Demo photography is loaded from Unsplash. Image requests expose standard connection information to that host. Replace remote images with local assets for a fully offline presentation.',
      ],
      [
        'Removing data',
        'Clear browser storage to remove local preferences. Account deletion requests enter the admin report queue; the demo does not automatically erase transactional history.',
      ],
    ],
  },
  cookies: {
    title: 'Cookies, without the mystery.',
    intro:
      'The application uses essential session and browser storage for its demonstration features.',
    sections: [
      [
        'Session cookie',
        'seconda-session is an HTTP-only, same-site cookie used to identify your account. It expires after seven days.',
      ],
      [
        'Local storage',
        'Drafts, preferences, recent searches, recently viewed listings and followed sellers stay on this device. Session storage temporarily keeps a promo code.',
      ],
      [
        'Your choice',
        'You can remove cookies and browser storage in your browser settings. No analytics or advertising trackers are intentionally installed in this application.',
      ],
    ],
  },
  imprint: {
    title: 'Imprint & demo information',
    intro: 'Shopper is a fictional brand created for this portfolio project.',
    sections: [
      [
        'Project identity',
        'This installation is a local development and demonstration environment. No registered marketplace operator, commercial address or real support service is represented.',
      ],
      [
        'Contact',
        'The contact form creates a local demo support record. It does not send an email or reach an external support team.',
      ],
      [
        'Images and brands',
        'Sample product names refer to their respective owners. The application is not affiliated with those brands. Remote photographs are illustrative and may not depict the exact model described.',
      ],
    ],
  },
  disputes: {
    title: 'Let’s work through it.',
    intro:
      'Open an order to request a return or raise a dispute. Requests are saved in the local demonstration database.',
    sections: [
      [
        'Start with a conversation',
        'Contact the seller from your purchases page and explain the issue clearly.',
      ],
      [
        'Create a case',
        'Choose Open dispute on your order, describe what happened and submit it. An administrator can review the case in the demo dashboard.',
      ],
      [
        'What happens next',
        'The demo records the case and its review status. It does not contact an external service, provide arbitration or issue money.',
      ],
    ],
  },
};
export const helpTopics = [
  'Buying',
  'Selling',
  'Payments',
  'Delivery',
  'Returns',
  'Account',
  'Security',
  'Auctions',
];
export const faqs: [string, string, string][] = [
  [
    'Buying',
    'How do I buy an item?',
    'Open a listing, choose the quantity and select Buy now or Add to bag. Review delivery and confirm a demo payment at checkout. No money is charged.',
  ],
  [
    'Selling',
    'How do I create a listing?',
    'Choose Sell an item and follow the eight steps. Your draft is saved on this device. Publish to add the item to the local marketplace database.',
  ],
  [
    'Payments',
    'Which payment methods are available?',
    'Card, TWINT and PayPal are shown as mock payment options. We do not request or store payment credentials.',
  ],
  [
    'Delivery',
    'Can I collect an item?',
    'Listings show whether pickup is available. Choose pickup at checkout and arrange details with the seller in Messages. Demo items are not actually delivered.',
  ],
  [
    'Returns',
    'How do I request a return?',
    'Go to Purchases, open your order and choose Request return. Explain the issue to create a local support case.',
  ],
  [
    'Account',
    'Can I use my own demo account?',
    'Yes. Register with sample details and a password of at least ten characters. Use the shared Alex demo account to explore seeded purchases, conversations and seller tools.',
  ],
  [
    'Security',
    'Are verification badges real?',
    'No. Verification, two-factor settings and phone/email confirmation are demonstrated interfaces. Do not treat them as actual identity checks.',
  ],
  [
    'Auctions',
    'How do bids work?',
    'Place a bid above the displayed minimum. The server validates the amount and deadline and stores the bid. Winning and losing tabs derive from the deadline and current bid; automatic settlement is not connected.',
  ],
];
