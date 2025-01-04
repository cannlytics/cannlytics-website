"""
Texts | Cannlytics Website
Copyright (c) 2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 9/15/2024
Updated: 1/3/2025
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports:
import os
from typing import Any

# External imports:
from django.conf import settings
from markdown import markdown
from pymdownx import emoji

# Internal imports:
from website.state import page_texts

# Define the project name.
# TODO: I don't think it's the best to import from settings.
# Is there a better place to define the project name?
# from website.settings import PROJECT_NAME as BASE
BASE = 'website'


def get_page_texts(request: Any, context: dict) -> dict:
    """Get and render any Markdown text documents for a given page."""
    docs = page_texts.get(context['page'], []) + page_texts.get(context['section'], [])
    if docs:
        for doc in docs:
            name = doc.replace('-', '_').replace('/', '_')
            context = get_markdown(
                request,
                context,
                BASE,
                page=doc,
                name=name,
            )
    return context


# Define Markdown extensions and configurations.
# Optional: Style blockquotes
# https://facelessuser.github.io/pymdown-extensions/extensions/emoji/
MARKDOWN_EXTENSIONS = [
    'admonition',
    'attr_list',
    'def_list',
    'codehilite',
    'fenced_code',
    'nl2br',
    'smarty',
    'tables',
    'mdx_math',
    'pymdownx.arithmatex',
    'pymdownx.emoji',
]
MARKDOWN_EXTENSION_CONFIGS = {
    'pymdownx.emoji': {
        'emoji_index': emoji.gemoji,
        'emoji_generator': emoji.to_png,
        'alt': 'html_entity',
        'options': {
            'image_path': 'https://github.com/images/icons/emoji/unicode/',
            'non_standard_image_path': 'https://github.com/images/icons/emoji/unicode/'
        }
    }
}


def get_local_markdown(app, page):
    """Load local markdown files."""
    doc = f'{page}.md'
    file_path = os.path.join(settings.BASE_DIR, app, 'static', app, 'docs', doc)
    file_path = os.path.normpath(file_path)
    with open(file_path, 'r', encoding='utf-8') as md_file:
        text = md_file.read()
    return text


def get_markdown(
        request,
        context,
        app,
        page=None,
        name='markdown',
        extensions=None,
):
    """Try loading markdown material into a given context.
    Args:
        request (HttpRequest): An HTTP request.
        context (dict): A dictionary of page context.
        app (str): The project name.
        page (str): The page name for locating page-specific markdown.
        extensions (list): A list of extensions, a pre-selected list
            of useful extensions is used by default.
        name (str): The context namespace, `markdown` by default.
    Returns
        (dict): Returns the context updated with any markdown.    
    """
    if extensions is None:
        extensions = MARKDOWN_EXTENSIONS
    if page is None:
        page = context['page']
    try:
        # Read the markdown.
        text = get_local_markdown(app, page)        

        # Render markdown into HTML.
        context[name] = markdown(
            text,
            extensions=extensions,
            extension_config=MARKDOWN_EXTENSION_CONFIGS
        )

        # Future work: Add copy code button.
        # text = add_code_copy(text)

    except Exception as e:

        # Handle any errors loading the markdown.
        print('Error loading markdown:', str(e))
        context[name] = "<h1>Error loading page material.</h1> \
        <p>Our apologies, our server encountered a yet-to-be-fixed bug. \
        Please notify <a href='mailto:contact@cannlytics.com'>contact@cannlytics.com</a> \
        and we will be quick to provide you with support.</p>"
    
    # Return the updated context.
    return context
