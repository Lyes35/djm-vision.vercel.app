
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const getChannelInsight = async (channelName: string) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channelName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error fetching channel insight:', error);
    return "معلومات القناة غير متوفرة حالياً.";
  }
};
