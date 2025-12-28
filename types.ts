
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface AIInsight {
  summary: string;
  category: string;
  recommendations: string[];
}

/**
 * Fix: Added GeneratedImage interface to support infographic rendering and editing
 */
export interface GeneratedImage {
  id: string;
  data: string;
  prompt: string;
}

/**
 * Fix: Added SearchResultItem interface to support search grounding research sources
 */
export interface SearchResultItem {
  title: string;
  url: string;
}
