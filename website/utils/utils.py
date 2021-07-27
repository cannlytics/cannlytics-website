"""
Utility Functions | Cannlytics Website
Created: 1/5/2021
"""
import re
import requests
import traceback
from datetime import datetime
from django.utils.crypto import get_random_string
from django.contrib.staticfiles.storage import staticfiles_storage
from markdown import markdown
from random import randint
from pymdownx import emoji
from markdown.extensions.toc import TocExtension

from website import state # Save text in Firestore?
from website.settings import DEBUG
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
    TocExtension(permalink='#'), # Creates table of contents with [TOC] and adds id's to headers.
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


def get_markdown(request, context, app, dir, page=None, extensions=None, name="markdown"):
    """Try loading markdown material into a given context."""
    if extensions is None:
        extensions = EXTENSIONS
    if page is None:
        page = context["page"]
    try:
        # TODO: Open markdown file in production directly, instead of with a request.
        file_name = staticfiles_storage.url(f"/{app}/docs/{page}.md")
        if DEBUG:
            url = dir + file_name
            markdown_file = open(url, "r")
            text = markdown_file.read()
        else:
            url = request.build_absolute_uri(file_name)
            text = requests.get(url).text
        context[name] = markdown(
            text,
            extensions=extensions,
            extension_config=EXTENSION_CONFIGS
        )
        # Optional: Add copy code button
        # text = add_code_copy(text)
    except Exception:
        traceback.print_exc()
        context[name] = '<h1>Error loading page material.</h1> \
        <p>Our apologies, our server encountered a yet-to-be-fixed bug. \
        Please notify <a href="mailto:contact@cannlytics.com">contact@cannlytics.com</a> \
        and we will be quick to provide you with support.</p>'
    return context


def add_code_copy(text):
    """Add copy button to code blocks."""
    # TODO: Make this code work | https://programmersought.com/article/48614916658/
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


def get_promo_code(num_chars):
    code_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    code = ''
    for i in range(0, num_chars):
        slice_start = randint(0, len(code_chars) - 1)
        code += code_chars[slice_start: slice_start + 1]
    return code.lower()


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
