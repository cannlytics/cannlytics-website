"""
Utility Functions | Cannlytics Website
Created: 1/5/2021
"""
import os
import re
import traceback
from datetime import datetime
from django.utils.crypto import get_random_string
# from django.templatetags.static import static
from django.contrib.staticfiles.storage import staticfiles_storage
from markdown import markdown
from pymdownx import emoji
# from markdown.extensions.toc import TocExtension

from cannlytics_website import state # Save text in Firestore?
from .firebase import add_to_array

# TODO: Style blockquotes
# https://facelessuser.github.io/pymdown-extensions/extensions/emoji/

EXTENSIONS = [
    "admonition",
    "attr_list",
    "def_list",
    "codehilite",
    "fenced_code",
    "nl2br", # Newlines treated as hard breaks
    "smarty",  # Converts dashes, quotes, and ellipses.
    "tables",  # Creates tables.
    # TocExtension(permalink=True), # Creates table of contents with [TOC] and adds id's to headers.
    'mdx_math', # FIXME: Parse LaTeX
    'pymdownx.arithmatex',
    'pymdownx.emoji',
    # Optional extensions:
    # 'pymdownx.superfences',
    # 'markdown.extensions.tables',
    # 'pymdownx.magiclink',
    # 'pymdownx.betterem',
    # 'pymdownx.highlight',
    # 'pymdownx.tilde',
    # 'pymdownx.tasklist',
    # 'pymdownx.superfences',
    # 'pymdownx.saneheaders',
]

EXTENSION_CONFIGS = {
    "pymdownx.emoji": {
        "emoji_index": emoji.gemoji,
        "emoji_generator": emoji.to_png,
        "alt": "html_entity",
        "options": {
            "image_path": "https://github.com/images/icons/emoji/unicode/",
            "non_standard_image_path": "https://github.com/images/icons/emoji/unicode/"
        }
    }
}

#----------------------------------------------#
# Rendering helpers
#----------------------------------------------#


def get_markdown(context, app, dir, page=None, options=None, name="markdown"):
    """Try loading markdown material into a given context."""
    if options is None:
        options = EXTENSIONS
    if page is None:
        page = context["page"]
    try:
        # FIXME: Open markdown file in production environment.
        # file_name = static(f"/{app}/docs/{page}.md")
        # module_dir = os.path.dirname(__file__)  # get current directory
        # file_path = os.path.join(module_dir, 'baz.txt')
        # markdown_file = open(dir + file_name, "r")
        url = staticfiles_storage.url(f"/{app}/docs/{page}.md")
        file_name = os.path.join(dir, url)
        print('Open:', file_name)
        markdown_file = open(file_name, "r")
        text = markdown_file.read()
        # text = add_code_copy(text) # Optional: Add copy button
        context[name] = markdown(
            text,
            extensions=options,
            extension_configs=EXTENSION_CONFIGS,
        )
    except Exception:
        traceback.print_exc()
        context[name] = '<h1>Error loading page material.</h1><p>Please notify <a href="mailto:contact@cannlytics.com">contact@cannlytics.com</a>.</p>'
    return context


def add_code_copy(text): # FIXME: https://programmersought.com/article/48614916658/
    """Add copy button to code blocks."""
    n = text.count('<div class="codehilite">', 0, len(text))
    print('Codeblocks:', n)
    for i in range(n):
        text = re.sub(r'<div class="codehilite">',
        '&nbsp;&nbsp;<button id="ecodecopy" style="float: right;z-index:10" class="copybtn" '
        'data-clipboard-action="copy" '
        'data-clipboard-target="#code{}">Copy</button> '
        '<div class="codehilite" id="code{}">'.format(i, i), text, 1)
    return text


#----------------------------------------------#
# Authentication helpers
#----------------------------------------------#


def generate_secret_key(env_file_name):
    """Generate a Django secret key."""
    env_file = open(env_file_name, "w+")
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    generated_secret_key = get_random_string(50, chars)
    env_file.write("SECRET_KEY = '{}'\n".format(generated_secret_key))
    env_file.close()


#----------------------------------------------#
# Drafts (Find home's within specific views / forms?)
#----------------------------------------------#


def add_contributor():
    """Add a contributor when they package is added."""
    # public/contributors
    entry = {
        "email": "",
        "github": "",
        "joined_at": datetime.now(),
        "location": "",
        "name": "",
        "organization": "",
        "stackoverflow": "",
        "twitter": "",
        "website": "",
    }
    # TODO: Check that user is not already a contributor.
    add_to_array("public/contributors", "contributors", entry)


def add_partner():
    """Add a partner when a donation is made."""
    # public/partners
    entry = {
        "description": "",
        "image_url": "",
        "name": "",
        "organization": "",
        "website": "",
    }
    # TODO: Check that user is not already a partner.
    add_to_array("public/partners", "partners", entry)


def add_package():
    """Add a package to community packages."""
    # Upload package to Firebase Storage
    # Record package details


def welcome_email(email):
    """Create a welcome email HTML template."""
    html = """
    <div>
    """
    return html
