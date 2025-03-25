/**
 * Copyright 2025 mwn5286
 * @license Apache-2.0, see LICENSE for full text.
 */

import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `link-preview-card`
 * 
 * @demo index.html
 * @element link-preview-card
 */

export class LinkPreviewCard extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "link-preview-card";
  }

  constructor() {
    super();
    this.title = "";
    this.webLink = "https://apple.com";
    this.description = "";
    this.imageLink = "";
    this.loading = false;

    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",
    };

    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/link-preview-card.ar.json", import.meta.url).href +
        "/../",
      locales: ["ar", "es", "hi", "zh"],
    });
  }

  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      webLink: { type: String, attribute: "web-link" },
      description: { type: String },
      imageLink: { type: String, attribute: "image-link" },
      loading: { type: Boolean },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          color: var(--ddd-primary-2);
          background-color: var(--ddd-theme-default-creekTeal);
          font-family: var(--ddd-font-secondary);
        }
        .wrapper {
          margin: var(--ddd-spacing-2);
          padding: var(--ddd-spacing-4);
        }
        h3 span {
          font-size: var(
            --link-preview-card-label-font-size,
            var(--ddd-font-size-s)
          );
        }
        #myimage {
          display: block;
          max-width: 200px;
          max-height: 200px;
          height: auto;
          margin: var(--ddd-spacing-2);
        }
        .intro {
          align-items: start;
          text-align: center;
          margin: var(--ddd-spacing-2);
          padding: var(--ddd-spacing-2);
          width: var(--ddd-breakpoint-md);
        }

        .card-content {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .link-search {
          margin-left: auto;
          margin-right: auto;
          display: block;
          text-align: center;
        }

        h1,h2,h3,h4,h5,h6 {
          margin: auto;
          padding: var(--ddd-spacing-2);
        }

        @media (max-width: 620px) {
        .wrapper {
          max-width: 600px;
          flex-wrap: nowrap;
        }
        .card-content {
          flex-direction: column;
          align-items: center;
        }
        .intro {
          max-width: 300px;
        }

        .loader {
          width: 50px;
          aspect-ratio: 1;
          display: grid;
          -webkit-mask: conic-gradient(from 15deg, #0000, #000);
          mask: conic-gradient(from 15deg, #0000, #000);
          animation: l26 1s infinite steps(12);
        }

        .loader,.loader:before,.loader:after {
          background: radial-gradient(
                closest-side at 50% 12.5%,
                #f03355 96%,
                #0000
              )
              50% 0/20% 80% repeat-y,
            radial-gradient(closest-side at 12.5% 50%, #f03355 96%, #0000) 0 50%/80%
              20% repeat-x;
        }

        .loader:before,.loader:after {
          content: "";
          grid-area: 1/1;
          transform: rotate(30deg);
        }

        .loader:after {
          transform: rotate(60deg);
        }

        @keyframes l26 {
          100% {
            transform: rotate(1turn);
          }
        }
      `,
    ];
  }

  // Lit render the HTML
  render() {
    return html`
      <div class="wrapper">
        ${this.loading
          ? html`<div class="loader"></div>` // Show loader when loading is true
          : html`
              <div class="card-content">
                <img
                  id="myimage"
                  src="${this.imageLink}"
                  alt="${this.t.title}: ${this.title}"
                  loading="lazy"
                  width="100%"
                />
                <div class="intro">
                  <div class="link-search">
                    <input
                      id="input"
                      placeholder="Search"
                      @keydown=${this.inputChanged}/>
                    <button id="search" @click="${this.inputChanged}">Search</button>
                  </div>
                  <h3>${this.title}</h3>
                  <p>${this.description}</p>
                  <p><br><a href="${this.webLink}" target="_blank">${this.webLink}</a></p>
                </div>
              </div>
            `}
        <slot></slot>
      </div>
    `;
  }

  inputChanged(e) {
    const inputValue = this.shadowRoot.querySelector("#input").value.trim();
    if ((e.type === "click" || e.key === "Enter") && !inputValue.startsWith("https:")) {
      alert("Please enter a valid URL starting with https:.");
    } else if (e.type === "click" || e.key === "Enter") {
      this.webLink = inputValue;
      this.loading = true;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has("webLink")) {
      this.updateResults();
    }
    setTimeout(() => {
      console.log("Delayed for 5 seconds.");
      this.loading = false;
    }, 5000);
  }

  // https://corsproxy.io/?url=
  async updateResults() {
    try {
      const response = await fetch(`https://open-apis.hax.cloud/api/services/website/metadata?q=${this.webLink}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const responseData = await response.json();
      this.title = responseData.data?.["og:title"] || responseData.data?.title || "Error: No title found";
      this.description = responseData.data?.["og:description"] || responseData.data?.description || "Error: No description found";
      this.imageLink = responseData.data?.["og:image"] || responseData.data?.["ld+json"]?.logo || responseData.data?.["ld+json"]?.publisher?.logo || "";

      if (!this.imageLink) {
        this.imageLink = "jfjfjfjdj";
        this.shadowRoot.querySelector("#myimage").removeAttribute("src");
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(LinkPreviewCard.tag, LinkPreviewCard);