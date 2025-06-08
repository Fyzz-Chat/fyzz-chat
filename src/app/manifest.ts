import type { MetadataRoute } from "next";

// Create a type that includes our experimental properties
type ManifestWithExtensions = MetadataRoute.Manifest & {
  // Controls how the PWA handles links - "preferred" makes app open for specific URLs instead of browser
  handle_links?: "preferred" | "auto";

  // Microsoft Edge specific - enables and configures the side panel feature
  edge_side_panel?: {
    preferred_width?: number;
  };

  // Experimental - declares permission requests for the PWA
  // Note: This doesn't automatically grant permissions; user will still be prompted
  permissions?: string[];

  // Controls how browser handles launching app when it's already open
  // navigate-existing: reuses existing window, auto: browser decides
  launch_handler?: {
    client_mode?: string[];
  };
};

export default function manifest(): ManifestWithExtensions {
  return {
    // Unique identifier for the application - used for installation
    id: "fyzz-chat",

    // Full name of the application - shown in app stores, launchers, etc.
    name: "Fyzz.chat - Chat with the best AI models, all in one place",

    // Short version of name - used on home screens where space is limited
    short_name: "Fyzz.chat",

    // Description of the app - used by app stores and installation prompts
    description:
      "One platform for GPT, Perplexity, Gemini, and more. Chat, speak with PDFs, and analyze images.",

    // The URL that loads when your app is launched
    start_url: "/",

    // How the app should be displayed - standalone removes browser UI
    // Other options include: fullscreen, minimal-ui, browser
    display: "standalone", // App icons used for installation, home screen, app stores, task switcher, etc.
    // You're providing multiple sizes and purposes for maximum compatibility
    icons: [
      // Standard icons with 'any' purpose - basic usage on most platforms
      {
        src: "/any-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any", // Generic icons for any context
      },
      {
        src: "/any-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },

      // Maskable icons - designed for platforms that apply icon masks/shapes
      // These have padding around the logo to prevent clipping in rounded corners
      {
        src: "/maskable-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable", // Indicates icon works with system-applied masks
      },
      {
        src: "/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },

      // Monochrome icon - used where single-color icons are needed
      // For adaptive UI like notification badges or platform-specific areas
      {
        src: "/monochrome-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome", // Single-color icon that platforms can recolor
      },
    ], // Screenshots used by app stores and install prompts to showcase your app
    screenshots: [
      {
        src: "/screenshot-desktop.png",
        sizes: "2880x1456",
        type: "image/png",
        form_factor: "wide", // Indicates this is for desktop/wide displays
        label: "Fyzz.chat desktop interface", // Accessible description of screenshot
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "593x1287",
        type: "image/png",
        form_factor: "narrow", // Indicates this is for mobile/narrow displays
        label: "Fyzz.chat mobile interface",
      },
    ], // Background color shown during app load or on splash screens
    background_color: "#2A2024",

    // Theme color for the browser UI elements (address bar, etc.) when app is open
    theme_color: "#2A2024",

    // Preferred screen orientation for the app
    // Options: portrait, landscape, portrait-primary, landscape-primary, etc.
    orientation: "portrait",

    // Primary language of the application
    lang: "en-US",

    // Text direction: ltr (left-to-right) or rtl (right-to-left)
    dir: "ltr",

    // Navigation scope - URLs within this path are considered part of the app
    // Pages outside this scope will open in browser instead of within the PWA
    scope: "/",

    // App categories for stores and directories - helps with searchability
    categories: ["productivity", "utilities", "ai"],

    // Display mode fallback list - browser tries first option, falls back to next
    // This gives you control over how your app appears if the primary mode isn't supported
    display_override: ["standalone", "browser"], // Quick access shortcuts shown in context menus and app launcher long-press menus
    // These provide direct deep links into specific areas of your app
    // shortcuts: [
    //   {
    //     name: "New Chat", // Text displayed for the shortcut
    //     url: "/chat", // Deep link URL to a specific part of your app
    //     description: "Start a new conversation", // Accessible description
    //     icons: [
    //       {
    //         src: "/any-icon-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //         purpose: "any",
    //       },
    //     ],
    //   },
    // ],
    // Controls how the app is launched when it's already running
    launch_handler: {
      client_mode: ["navigate-existing", "auto"], // Reuse existing window if possible
    },

    // Whether to recommend the related native apps over this web app
    prefer_related_applications: false,

    // List of related native applications (mobile apps typically)
    related_applications: [
      // Example - uncomment and modify if needed
      // {
      //   platform: "play", // Platform: play, itunes, windows, etc.
      //   url: "https://play.google.com/store/apps/details?id=com.fyzzchat.app", // Store URL
      //   id: "com.fyzzchat.app" // App ID in the platform's ecosystem
      // }
    ],

    // EXPERIMENTAL: Controls how the PWA handles links
    // "preferred" makes app open for specific URLs instead of browser when possible
    handle_links: "preferred",

    // EXPERIMENTAL: Microsoft Edge specific feature for PWAs in the Edge sidebar
    edge_side_panel: {
      preferred_width: 400, // Width in pixels when opened in Edge side panel
    },

    // EXPERIMENTAL: Declares permission requests for the PWA
    permissions: ["camera", "clipboard-read", "clipboard-write", "file-system"],
  };
}
