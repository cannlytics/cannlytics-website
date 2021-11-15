from django.template.defaultfilters import register

@register.filter(name='kebab_to_title')
def kebab_to_title(value):
    """Returns a given kebab-case string as a title."""
    return value.replace('-', ' ').title()
