# Configuration

The `config` prop accepts a `ConfigInterface` object. All fields are optional — any omitted value falls back to the default.

```tsx
import AsyncAPI from "aui";

<AsyncAPI asyncapi={doc} config={{ /* ... */ }} />
```

## Show

Controls which sections of the user interfaces are visible.

| Field             | Type      | Default | Description                                      |
|-------------------|-----------|---------|--------------------------------------------------|
| `sidebar`         | `boolean` | `true`  | Show/hide the side navigation panel              |
| `info`            | `boolean` | `true`  | Show/hide the API info header                    |
| `servers`         | `boolean` | `true`  | Show/hide the Servers section                    |
| `operations`      | `boolean` | `true`  | Show/hide the Operations tab and its content     |
| `messages`        | `boolean` | `true`  | Show/hide the Messages tab and its content       |
| `schemas`         | `boolean` | `false` | Show/hide the Schemas tab and its content        |
| `messageExamples` | `boolean` | `false` | Show/hide generated examples within messages     |

Setting a tab to `false` removes it from both the tab bar and the side navigation.

```ts
config: {
  show: {
    sidebar: true,
    schemas: false,
    messageExamples: true,
  }
}
```

## Sidebar

Options for the side navigation panel.

| Field                        | Type      | Default | Description                                                                         |
|------------------------------|-----------|---------|-------------------------------------------------------------------------------------|
| `useChannelAddressAsIdentifier` | `boolean` | `false` | Display the channel address instead of the operation key in the nav item label |

```ts
config: {
  sidebar: {
    useChannelAddressAsIdentifier: true,
  }
}
```

## Expand

Controls default expanded/collapsed state of collapsible sections.


## Theme

Customise the visual appearance. All color values must be hex strings (e.g. `"#0EA5E9"`).

### Mode

| Value    | Description                                                                                 |
|----------|---------------------------------------------------------------------------------------------|
| `"dark"` | Activates dark mode. Inverts the neutral color scale and applies `colors` semantic overrides |


When `mode` is not `"dark"`, light mode defaults from the CSS variables in `index.css` are used.

---

### `primary` / `secondary` / `neutral`

Color scales used for accents, interactive elements, and backgrounds. Each scale accepts individual shade values.

| Shade | Usage example                              |
|-------|--------------------------------------------|
| `50`  | Very light tint: hover backgrounds        |
| `100` | Light tint: badges, tag backgrounds       |
| `200` | Light: borders on tinted elements         |
| `300` | Mid-light: muted accents                  |
| `500` | Base: icons, active indicators            |
| `600` | Dark: active text, links                  |
| `700` | Darkest: pressed/focus states             |

```ts
config: {
  theme: {
    primary: {
      50:  "#F0F9FF",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      500: "#0EA5E9",
      600: "#0284C7",
      700: "#0369A1",
    },
  }
}
```

---

### `colors`

Semantic overrides for background and text surfaces. Only applied when `mode: "dark"` is set.

| Field           | CSS target             | Description                          |
|-----------------|------------------------|--------------------------------------|
| `background`    | `--color-background`   | Page/component background            |
| `surface`       | `--color-surface`      | Card and panel backgrounds           |
| `border`        | `--color-border`       | Dividers, input borders              |
| `textPrimary`   | `--color-text-primary` | Primary body text                    |
| `textSecondary` | `--color-text-secondary` | Secondary / supporting text        |
| `textMuted`     | `--color-text-muted`   | Placeholder, disabled, faint labels  |

```ts
config: {
  theme: {
    mode: "dark",
    colors: {
      background:    "#0f172a",
      surface:       "#1e293b",
      border:        "#334155",
      textPrimary:   "#f8fafc",
      textSecondary: "#cbd5e1",
      textMuted:     "#94a3b8",
    },
  }
}
```


<!-- ## requestLabel / replyLabel

Override the labels used for request/reply message pairs.

| Field          | Type     | Default     |
|----------------|----------|-------------|
| `requestLabel` | `string` | `"Request"` |
| `replyLabel`   | `string` | `"Reply"`   |

--- -->

## Full example

```ts
const config = {
  show: {
    sidebar: true,
    info: true,
    servers: true,
    operations: true,
    messages: true,
    messageExamples: false,
    schemas: true,
  },
  sidebar: {
    useChannelAddressAsIdentifier: true,
  },
  theme: {
    mode: "dark",
    primary: {
      50:  "#F0F9FF",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      500: "#0EA5E9",
      600: "#0284C7",
      700: "#0369A1",
    },
    colors: {
      background:    "#0f172a",
      surface:       "#1e293b",
      border:        "#334155",
      textPrimary:   "#f8fafc",
      textSecondary: "#cbd5e1",
      textMuted:     "#94a3b8",
    },
  }
};
```
