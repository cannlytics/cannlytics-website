"""
State Variables | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 10/15/2020
Updated: 9/23/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# pylint:disable=line-too-long
from website.settings import DEFAULT_FROM_EMAIL, CONTACT_PHONE, CONTACT_PHONE_NUMBER


# Define the company context.
company_context = {
    'donation_url': 'https://opencollective.com/cannlytics-company',
    'meetup_url': 'https://meet.google.com/ifq-jtmc-nuh',
}

# Define the application context.
app_context = {
    'company_name': 'Cannlytics',
    'company_url': 'https://cannlytics.com',
    "contact_email": DEFAULT_FROM_EMAIL,
    "contact_phone": CONTACT_PHONE,
    "contact_phone_number": CONTACT_PHONE_NUMBER,
    "index": [
        {
            "name": "Data",
            "links": [
                {"title": "📜 COAs", "page": "coas"},
                {"title": "🧪 Results", "page": "results"},
                {"title": "🪴Strains", "page": "strains"},
                {"title": "🧑‍🌾 Organizations", "page": "orgs"},
                {"title": "🔬 Compounds", "page": "compounds"},
            ]
        },
        {
            "name": "Analytics",
            "links": [
                {"title": "🤖 Parsers", "page": "parsers"},
                {"title": "📡 API", "page": "api"},
                {"title": "🧑‍🔬 Research", "page": "research"},
                {"title": "📊 Stats", "page": "stats"},
                {"title": "📝 Papers", "page": "papers"},
            ]
        },
        {
            "name": "Tech",
            "links": [
                {"title": "🪟 App", "url": "https://app.cannlytics.com/"},
                {"title": "🙀 Open Source", "url": "https://github.com/cannlytics"},
                {"title": "🤗 Datasets", "url": "https://huggingface.co/cannlytics"},
                {"title": "🔰 Metrc SDK", "url": "https://github.com/cannlytics/cannlytics/tree/main/cannlytics/metrc"},
                {"title": "🧑‍💻 Developers", "page": "developers"},
            ]
        },
        {
            "name": "Company",
            "links": [
                {"title": "📒 About", "page": "about"},
                {"title": "🤝 Support", "page": "support"},
                {"title": "💸 Subscriptions", "page": "account", "section": "subscriptions"},
                {"title": "🎙️ Meetup", "url": "https://meetup.com/cannabis-data-science"},
                {"title": "⚖️ TOS", "page": "terms-of-service"},
            ]
        }
    ],
}

#-----------------------------------------------------------------------
# Page-specific material.
#-----------------------------------------------------------------------

# Define page-specific material.
material = {
    "account": {
        "user_fields": [
            {"key": "name", "label": "Name"},
            {"key": "username", "label": "Username"},
            {"key": "email", "label": "Email", "type": "email"},
            {"key": "phone_number", "label": "Phone"},
            {"key": "position", "label": "Position"},
        ],
        "user_options": [
            {
                "title": "Change your password",
                "section": "password-reset",
            },
            {
                "title": "Manage your subscriptions",
                "section": "subscriptions",
            },
            {
                "title": "Manage your API keys",
                "section": "api-keys",
            },
        ],
    },
}

#-----------------------------------------------------------------------
# Page-specific markdown texts.
#-----------------------------------------------------------------------

# Texts where the key is the page and the value is a list of markdown.
page_texts = {
    "api": ["api"],
    "about": ["about"],
    "support": ["support"],
    "terms-of-service": ["terms-of-service"],
}

#-----------------------------------------------------------------------
# Page-specific data loaded from Firestore.
#-----------------------------------------------------------------------

# Page data where the key is the page name and the value is a dictionary
# of `collections` and `documents` that contain Firestore queries.
page_data = {
    "account": {
        "collections": [
            {
                "name": "subscription_plans",
                "ref": "public/subscriptions/subscription_plans",
                "order_by": "price_per_token",
                "desc": False
            },
        ],
        "documents": [
            {
                "name": "paypal",
                "ref": "credentials/paypal"
            }
        ]
    },
    "checkout": {
        "documents": [
            {
                "name": "paypal",
                "ref": "credentials/paypal"
            }
        ]
    },
    "developers": {
        "collections": [
            {
                "name": "contributors",
                "ref": "public/contributors/contributor_data"
            }
        ]
    },
    "personality": {
        "documents": [
            {
                "name": "variables",
                "ref": "public/data/variables/personality_test"
            }
        ]
    },
    "subscriptions": {
        "documents": [
            {
                "name": "paypal",
                "ref": "credentials/paypal"
            }
        ],
        "collections": [
            {
                "name": "sponsorships",
                "ref": "public/subscriptions/sponsorships",
                "order_by": "cost",
                "desc": True
            },
            {
                "name": "verifications",
                "ref": "public/verifications/verification_data",
                "limit": None,
                "order_by": "state"
            }
        ]
    },
    "papers": {
        "collections": [
            {
                "name": "whitepapers",
                "ref": "public/whitepapers/whitepaper_data"
            }
        ]
    }
}
