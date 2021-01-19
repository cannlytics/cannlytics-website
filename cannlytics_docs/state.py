"""
State Variables | Cannlytics Docs
Created: 1/18/2021
TODO: Turn into models and save in database.
"""

state = {
    "index": [
        {
            "product": "api",
            "title": "API",
            "description": "Perform all operations programatically in your favorite programming language.",
            "image_path": "cannlytics_website/images/lab_icons/cannlytics_eye.svg",
            "sections": [
                {"slug": "get-started", "title": "Get Started"},
                {"slug": "installation", "title": "Installation"},
            ],
        },
        {
            "product": "app",
            "title": "App",
            "description": "Utilize a variety of user interfaces with the suite of Cannlytics desktop and mobile apps.",
            "image_path": "cannlytics_website/images/lab_icons/cannlytics_beanstalk.svg",
            "sections": [
                {"slug": "get-started", "title": "Get Started"},
            ],
        },
        {
            "product": "lims",
            "title": "LIMS",
            "description": "Receive samples, perform analyses, collect and review results, and publish CoAs.",
            "image_path": "cannlytics_website/images/lab_icons/cannlytics_mortle_pestle.svg",
            "sections": [
                {"slug": "get-started", "title": "Get Started"},
                # Introduction
                # Installation
                # Authentication
                # Database
                # File Storage
                # Hosting
                # Analytics
                # Automation
                # API
                # Customization
                # Integrations
            ],
        },
        {
            "product": "portal",
            "title": "Portal",
            "description": "Access to laboratory results for lab users; producers, processors, retailers, and consumers.",
            "image_path": "cannlytics_website/images/lab_icons/cannlytics_brain.svg",
            "sections": [
                {"slug": "get-started", "title": "Get Started"},
                {"slug": "installation", "title": "Installation"},
            ],
        },
        {
            "product": "website",
            "title": "Website",
            "description": "Capitalize on Cannlytics' free and powerful web technology stack to market your laboratory.",
            "image_path": "cannlytics_website/images/lab_icons/cannlytics_atom.svg",
            "sections": [
                {"slug": "get-started", "title": "Get Started"},
                {"slug": "installation", "title": "Installation"},
                {"slug": "development", "title": "Development"},
                {"slug": "publishing", "title": "Publishing"},
            ],
        },
        # Authentication, Database, File Storage, Hosting
        # Analytics, Automation, Customization, Integrations
        # Examples, packages
    ]
}
