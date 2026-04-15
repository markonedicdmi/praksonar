# Automatically created by: shub deploy

from setuptools import setup, find_packages

setup(
    name         = 'project',
    version      = '1.0',
    packages     = find_packages(),
    install_requires = [
        'supabase>=2.5.1',
        'httpx>=0.27.0',
    ],
    entry_points = {'scrapy': ['settings = praksonar.settings']},
)
