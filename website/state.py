"""
State Variables | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 10/15/2020
Updated: 9/21/2024
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
                {"title": "COAs", "page": "coas"},
                {"title": "Results", "page": "results"},
                {"title": "Strains", "page": "strains"},
                {"title": "Organizations", "page": "orgs"},
                {"title": "Compounds", "page": "compounds"},
            ]
        },
        {
            "name": "Analytics",
            "links": [
                {"title": "Parsers", "page": "parsers"},
                {"title": "API", "page": "api"},
                {"title": "Research", "page": "research"},
                {"title": "Stats", "page": "stats"},
                {"title": "Papers", "page": "papers"},
            ]
        },
        {
            "name": "Tech",
            "links": [
                {"title": "GitHub", "url": "https://github.com/cannlytics"},
                {"title": "Hugging Face", "url": "https://huggingface.co/cannlytics"},
                {"title": "Metrc SDK", "url": "https://github.com/cannlytics/cannlytics/tree/main/cannlytics/metrc"},
                {"title": "Contributors", "page": "contributors"},
            ]
        },
        {
            "name": "Company",
            "links": [
                {"title": "About", "page": "about"},
                {"title": "Support", "page": "support"},
                {"title": "Meetup", "url": "https://meetup.com/cannabis-data-science"},
                # {"title": "Privacy", "url": "https://docs.cannlytics.com/about/privacy-policy"},
                # {"title": "Security", "url": "https://docs.cannlytics.com/about/security-policy"},
                {"title": "Terms of Service", "url": "https://docs.cannlytics.com/about/terms-of-service"},
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
    "homepage": {
        "hero": {
            "title": 'Cannabis Data and Analytics',
            "message": "And a suite of tools that you can use to wrangle, standardize, and analyze cannabis data.",
            "image": "https://firebasestorage.googleapis.com/v0/b/cannlytics.appspot.com/o/public%2Fimages%2Fbackgrounds%2Fwebsite%2FPXL_20230725_183052221.jpg?alt=media&token=639d1ed0-b88c-45be-9c54-1697a57f2e5c",
            "primary_action": "Get Started 🌱",
            "primary_action_url": "https://data.cannlytics.com",
            "secondary_action": "Sign Up 🚀",
            "secondary_action_url": "https://app.cannlytics.com",
        },
    },
}

#-----------------------------------------------------------------------
# Page-specific markdown texts.
#-----------------------------------------------------------------------

# Texts where the key is the page and the value is a list of markdown.
page_texts = {
    "ai": ["ai", "ai_conclusion"],
    "api": ["api"],
    "data-science": ["data-science"],
    "data": ["data", "regulations"],
    "economics": ["economics", "forecasting"],
    "integrators": ["integrators"],
    "producers": ["producers", "processors"],
    "regulations": ["regulations"],
    "retailers": ["retailers"],
    "farm": ["algorithm_market"],
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
    "articles": {
        "collections": [
            {
                "name": "articles",
                "ref": "public/articles/article_data",
                "limit": 10,
                "order_by": "published_at",
                "desc": True
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
    "contributors": {
        "collections": [
            {
                "name": "contributors",
                "ref": "public/contributors/contributor_data"
            }
        ]
    },
    "events": {
        "collections": [
            {
                "name": "events",
                "ref": "public/events/event_data"
            }
        ]
    },
    "homepage": {
        "collections": [
            {
                "name": "video_archive",
                "ref": "public/videos/video_data",
                "limit": 9,
                "order_by": "published_at",
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
    "jobs": {
        "collections": [
            {
                "name": "jobs",
                "ref": "public/data/jobs",
                "limit": 10,
            },
            {
                "name": "team",
                "ref": "public/team/team_members"
            }
        ],
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
    "team": {
        "collections": [
            {
                "name": "team",
                "ref": "public/team/team_members"
            }
        ]
    },
    "videos": {
        "collections": [
            {
                "name": "video_archive",
                "ref": "public/videos/video_data",
                "limit": 10,
                "order_by": "published_at",
                "desc": True
            }
        ],
    },
    "whitepapers": {
        "collections": [
            {
                "name": "whitepapers",
                "ref": "public/whitepapers/whitepaper_data"
            }
        ]
    }
}
