import { defineElement, Element, type IconData } from '@lordicon/element';

// Lordicon's current library uses base64/XOR-encoded .li files. Its public
// element package still loads JSON only; use the same decoder as lordicon.com.
class PortfolioIcon extends Element {
  protected async loadIconData(): Promise<IconData> {
    if (this.icon || !this.src || !new URL(this.src, location.href).pathname.endsWith('.li')) {
      return super.loadIconData();
    }

    const response = await fetch(this.src);
    if (!response.ok) throw new Error(`Lordicon request failed: ${response.status} (${this.src})`);

    const encoded = (await response.text()).trim();
    const json = Array.from(atob(encoded), (character) =>
      String.fromCharCode(character.charCodeAt(0) ^ 42)
    ).join('');
    this._loadedIconData = JSON.parse(json);
    return this._loadedIconData;
  }
}

if (!customElements.get('lord-icon')) {
  customElements.define('lord-icon', PortfolioIcon);
}
defineElement();
