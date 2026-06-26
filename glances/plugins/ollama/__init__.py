#
# This file is part of Glances.
#
# SPDX-FileCopyrightText: 2024 Glances Team
#
# SPDX-License-Identifier: LGPL-3.0-only
#

"""Ollama Local LLM plugin."""

import json
import urllib.request
import urllib.error

from glances.plugins.plugin.model import GlancesPluginModel
from glances.logger import logger


class OllamaPlugin(GlancesPluginModel):
    """Glances Ollama plugin.

    stats is a list of dictionaries (one dictionary per loaded model)
    """

    def __init__(self, args=None, config=None):
        """Init the plugin."""
        super().__init__(args=args, config=config)

        # We want to display the stat in the curse interface
        self.display_curse = True
        self.align = 'left'

        # Ollama default API endpoint for loaded models
        self.api_url = "http://localhost:11434/api/ps"
        
        self.stats = []

    def get_key(self):
        """Return the key of the list."""
        return 'name'

    @GlancesPluginModel._check_decorator
    @GlancesPluginModel._log_result_decorator
    def update(self):
        """Update ollama stats using the REST API."""
        stats = []

        if self.input_method == 'local':
            try:
                # Add timeout to prevent hanging the whole Glances loop
                req = urllib.request.Request(self.api_url)
                with urllib.request.urlopen(req, timeout=1.0) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    if 'models' in data:
                        for model in data['models']:
                            stats.append({
                                'name': model.get('name', 'unknown'),
                                'size': model.get('size', 0),
                                'size_vram': model.get('size_vram', 0)
                            })
            except (urllib.error.URLError, json.JSONDecodeError) as e:
                # Ollama is probably not running or unreachable
                logger.debug(f"Ollama plugin - Cannot connect to Ollama API: {e}")
                pass
            except Exception as e:
                logger.error(f"Ollama plugin - Unexpected error: {e}")
                pass

        self.stats = stats
        return self.stats

    def msg_curse(self, args=None, max_width=None):
        """Return the string to display in the curse interface."""
        ret = []

        if not self.stats or self.is_disabled():
            return ret

        msg = 'Ollama'
        ret.append(self.curse_add_line(msg, "TITLE"))
        ret.append(self.curse_add_line('\n'))

        for model in self.stats:
            name = model.get('name', '')
            # Simple conversion to GB for console UI
            vram_gb = model.get('size_vram', 0) / (1024 ** 3)
            ret.append(self.curse_add_line(f"{name:20} "))
            ret.append(self.curse_add_line(f"{vram_gb:.1f}GB VRAM", "INFO"))
            ret.append(self.curse_add_line('\n'))

        return ret
