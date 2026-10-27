/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the contact form posts (Formspree, Web3Forms or your own API). */
  readonly VITE_FORM_ENDPOINT?: string;
}
