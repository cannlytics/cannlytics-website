"""
State Variables | Cannlytics Website
Author: Keegan Skeate <keegan@cannlytics.com>
Created: 10/15/2020
Updated: 7/27/2021
"""

page_data = {
    "contributors": {
        "collections": [{"name": "contributors", "ref": "contributors"}],
    },
    "events": {
        "collections": [{"name": "events", "ref": "events"}],
    },
    "homepage": {
        "collections": [
            {
                "name": "video_archive",
                "ref": "public/videos/video_data",
                "limit": 3,
                "order_by": "published_at",
                "desc": True
            }
        ],
    },
    "products": {
        "collections": [{"name": "products", "ref": "products"}],
    },
    "partners": {
        "collections": [{"name": "partners_list", "ref": "partners"}],
    },
    "team": {
        "collections": [{"name": "team", "ref": "team"}],
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
        "collections": [{"name": "whitepapers", "ref": "whitepapers"}],
    }
}

page_docs = {
    "about": ["about"],
    "contributors": ["contribute"],
    "privacy-policy": ["privacy-policy"],
    "terms-of-service": ["terms-of-service"],
    "roadmap": ["roadmap"],
}

state = { # Optional: Turn into models and save in database?
  "contact": {
      "title": "You're welcome to contact us anytime about anything.",
      "message": "Please enter your contact information and message and the team will get back to you as soon as possible.",
  },
  "general": {
    "title": "Cannlytics",
    "blurb": "Cannlytics is a suite of free software for cannabis-testing laboratories, empowering you with a state-of-the-art system.",
    "email": "contact@cannlytics.com",
    "phone": "(828) 395-3954",
    "phone_number": "18283953954",
    "social": [
        { 
          "title": "GitHub",
          "url": "https://github.com/cannlytics"
        },
        { 
          "title": "LinkedIn",
          "url": "https://linkedin.com/company/cannlytics"
        },
    ]
  },
  "header": {
    "action": {
        "title": "Download",
        "url": "download"
    },
    "links": [
        {
            "slug": "community",
            "title": "Community"
        },
        {
            "slug": "posts",
            "title": "Docs"
        },
        {
            "slug": "contact",
            "title": "Contact"
        },
    ]
  },
  "homepage": {
    "hero": {
        # AB TEST 1:
        # "title": "A Modern Cannabis-Testing Engine",
        "title": "Cannabis Analytics for the 21st Century",
        # AB TEST 2:
        # "message": "Super power your lab with free and ethical cannabis-testing software made with 💖, tried-and-true, and ready for you to plug and play or pop the hood and tinker to your heart's content.",
        "message": "Super power your lab with open-source cannabis-testing software made with love and ready for you to plug & play or pop the hood and tinker to your 💖's content.",
        "image": "website/images/engine_icons/space_station.svg",
        "primary_action": "Get Started",
        "primary_action_url": "/docs",
        "secondary_action": "Sign Up",
        "secondary_action_url": "https://console.cannlytics.com",
    },
    "features": [
        {
            "title": "Smart Integrations",
            "message": "We believe that everyone benefits when people are able to study and tinker with their software. With the freedom provided by Cannlytics, users control their software and what it does for them.",
            "image": "website/images/illustrations/outline/lab_tablet.svg",
            "action": "View options",
            "action_url": "/support",
        },
        {
            "title": "Analysis Tailored",
            "message": "Cannlytics provides a user-friendly interface to quickly receive samples, perform analyses, collect and review results, and publish certificates of analysis (CoAs). There are also built in logistics, CRM (client relationship management), inventory management, and invoicing tools.",
            # "message": "Built by scientist for scientists. Data collection can be performed with the Cannlytics command line tool or with the Cannlytics Beanstalk. The Beanstalk is a light-weight app installed on an instrument's operating computer that automatically funnels results into your database.",
            # "message": "Data collection can be performed with the Cannlytics command line tool or with the Cannlytics Beanstalk. The Beanstalk is a light-weight app installed on an instrument's operating computer that automatically funnels results into your database.",
            "image": "website/images/illustrations/outline/lab_microscope.svg",
            "action": "Contribute now",
            "action_url": "/community",
            "action": "Begin customizing",
            "action_url": "https://console.cannlytics.com",
        },
        {
            "title": "Community Driven", # vs. People Centric (AB TEST)
            "message": "Built by scientist for scientists. Cannlytics empowers you with control over the development process, resources, and decision making authority. We believe that the Cannlytics community is the best judge of how Cannlytics can be improved, so, we have entrusted Cannlytics' source code with you.",
            "image": "website/images/illustrations/outline/lab_microbiologist.svg",
            "action": "Contribute now",
            "action_url": "/community",
        }
    ],
    "featurettes": [
        {
            "title": "Automate your lab.",
            "subtitle": "Free your time for science and analysis.",
            "message": "The more mundane tasks that you can automate and execute quickly and efficiently with the Cannlytics Engine, then the more time you have to conduct science and experiments.",
            "image": "website/images/screenshots/console_intake_light.png",
            "image_dark": "website/images/screenshots/console_intake_dark.png",
        },
        {
            "title": "Extend, modify, and personalize.",
            "subtitle": "Add anything that you need.",
            "message": "An advantage of the Cannlytics Engine over proprietary software solutions is that Cannlytics lets you make modifications as you need because Cannlytics is an open box of free software.",
            "image": "website/images/screenshots/console_account_light.png",
            "image_dark": "website/images/screenshots/console_account_dark.png",
        },
        {
            "title": "Freedom at your fingertips.",
            "subtitle": "It's all yours.",
            "message": "Cannlytics is a system of free software that you can use to power your lab. Cannlytics belongs to you so that you can use the Cannlytics Engine however that you please. Free software lets you operate ethically with the sky as the limit.",
            "image": "website/images/screenshots/console_help_light.png",
            "image_dark": "website/images/screenshots/console_help_dark.png",
        }
    ]
  },
  "support": {
      "pricing_tiers": [
            {
                "name": "Free",
                "price": "👐",
                "color": "green",
                "action": "Sign up for free",
                "url": "https://console.cannlytics.com",
                "attributes": [
                    "All software",
                    "All community material",
                    "GitHub Issues",
                    "Email support",
                ],
            },
            {
                "name": "Premium",
                "price": "$500 / mo.",
                "color": "orange",
                "action": "Get started",
                "url": "/subscriptions/checkout/?name=Premium",
                "attributes": [
                    "Metrc integration",
                    "Access to development builds",
                    "Priority GitHub Issues",
                    "Remote support",
                ],
            },
            {
                "name": "Enterprise",
                "price": "$2000 / mo.",
                "color": "purple",
                "action": "Contact us",
                "url": "/subscriptions/checkout/?name=Enterprise",
                "attributes": [
                    "Custom installation",
                    "Access to internal tools",
                    "Early access to new features",
                    "3 on-site support days / year",
                ],
            },
      ],
  },
  "partners": {
      "fields": [
            {"type": "email", "key": "email", "title": "Email"},
            {"type": "text", "key": "name", "title": "Name"},
            {"type": "text", "key": "twitter", "title": "Twitter", "group": "@"},
            {"type": "text", "key": "linkedin", "title": "LinkedIn"},
            {"type": "text", "key": "position", "title": "Position"},
            {"type": "text", "key": "location", "title": "Location"},
        ],
  },
  "footer": {
    "index": [
        {
          "name": "Community",
          "links": [
              {"title": "Labs", "page": "community"},
              {"title": "Producers", "page": "producers"},
              {"title": "Retailers", "page": "retailers"},
              {"title": "Consumers", "page": "consumers"},
              {"title": "Platform", "url": "https://console.cannlytics.com"},
          ]
        },
        {
          "name": "Docs",
          "links": [
              {"title": "API", "url": "https://docs.cannlytics.com/api/about"},
              {"title": "Users", "url": "https://docs.cannlytics.com/console/get-started"},
              {"title": "Developers", "url": "https://docs.cannlytics.com/developers/development"},
              {"title": "LIMS", "url": "https://docs.cannlytics.com/cannlytics/lims/lims"},
              {"title": "Metrc", "url": "https://docs.cannlytics.com/cannlytics/traceability/metrc"}
          ]
        },
        {
          "name": "About",
          "links": [
            {"title": "Story", "url": "https://docs.cannlytics.com/about/about"},
            {"title": "Roadmap", "url": "https://docs.cannlytics.com/developers/roadmap"},
            {"title": "Whitepapers", "page": "whitepapers"},
            {"title": "Donations", "url": "https://opencollective.com/cannlytics-company"},
            # {"title": "Become a partner", "page": "partners"},
            {"title": "Support", "page": "support"},
          ]
        }
    ]
  },
}

# TODO: Create entries in Firestore using Github API
packages = [
    {
        "name": "Cannlytics API",
        "url": "https://docs.cannlytics.com/api/about",
        "path": "api",
        "description": "",
        "created_at": "",
        "updated_at": "",
        "version": "",
        "readme_url": "",
        "likes": 0,
        "downloads": 0,
        "license": "",
        "repo_url": "",
        "issues_url": "",
        "documentation_url": "",
    },
    {
        "title": "Cannlytics App",
        "url": "https://docs.cannlytics.com/console/get-started",
        "path": "app"
    },
    {
        "title": "Cannlytics LIMS",
        "url": "https://docs.cannlytics.com/cannlytics/lims/lims",
        "path": "lims"
    },
    {
        "title": "Cannlytics Console",
        "url": "https://docs.cannlytics.com/console/get-started/",
        "path": "portal"
    },
]

lab_state = {
    "detail_fields": [
        {"key": "name", "title": "Name", "type": "text"},
        {"key": "trade_name", "title": "Trade name", "type": "text"},
        {"key": "phone", "title": "Phone", "type": "text"},
        {"key": "email", "title": "Email", "type": "email"},
        {"key": "website", "title": "Website", "type": "text"},
        {"key": "linkedin", "title": "LinkedIn", "type": "text"},
        {"key": "street", "title": "Street", "type": "text"},
        {"key": "city", "title": "City", "type": "text"},
        {"key": "county", "title": "County", "type": "text"},
        {"key": "state", "title": "State", "type": "text"},
        {"key": "zip", "title": "Zip", "type": "text"},
        {"key": "latitude", "title": "Latitude", "type": "number"},
        {"key": "longitude", "title": "Longitude", "type": "number"},
        {"key": "license", "title": "License", "type": "text"},
        {"key": "license_url", "title": "License URL", "type": "text"},
        {"key": "status", "title": "License status", "type": "text"},
        {"key": "capacity", "title": "Capacity", "type": "text"},
        {"key": "square_feet", "title": "Square Feet", "type": "text"},
        {"key": "brand_color", "title": "Brand color", "type": "color"},
        {"key": "secondary_color", "title": "Secondary color", "type": "color"},
        {"key": "favicon", "title": "Icon URL", "type": "textarea"},
        {"key": "image_url", "title": "Image URL", "type": "textarea"},
        # TODO: Keep track of certifications
        # dea_licensed_hemp_lab
        # a2la
    ],
    "tabs": [
        {"name": "Details", "section": "details", "active": "true"},
        {"name": "Analyses", "section": "analyses"},
        {"name": "Change log", "section": "logs"},
    ]
}
