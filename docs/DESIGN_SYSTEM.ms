Understood, Keketso. Here’s a clean, **markdown-ready document** you can feed directly into your agent.

---

# **Design System: Color Token Specification (v1.0)**

## **Overview**

This system defines a structured, token-driven color architecture with three layers:

```
Primitive → Semantic → Component
```

* **Primitive**: Raw color values (source of truth)
* **Semantic**: Contextual usage tokens
* **Component**: Implementation layer (must only use semantic tokens)

No hex values are allowed outside the primitive layer.

---

# **1. Primitive Tokens**

## **Structure**

```
primitive.{color}.{scale}
```

## **Scale**

```
50, 100, 200, 300, 400, 600, 800, 1000, 1300, 1700, 2100
```

---

## **1.1 Gray (Neutral)**

```
primitive.gray.50   = #f9fafb
primitive.gray.100  = #f3f4f6
primitive.gray.200  = #e5e7eb
primitive.gray.300  = #d1d5db
primitive.gray.400  = #9ca3af
primitive.gray.600  = #6b7280
primitive.gray.800  = #4b5563
primitive.gray.1000 = #374151
primitive.gray.1300 = #1f2937
primitive.gray.1700 = #111827
primitive.gray.2100 = #030712
```

---

## **1.2 Blue**

```
primitive.blue.50   = #eff6ff
primitive.blue.100  = #dbeafe
primitive.blue.200  = #bfdbfe
primitive.blue.300  = #93c5fd
primitive.blue.400  = #60a5fa
primitive.blue.600  = #3b82f6
primitive.blue.800  = #2563eb
primitive.blue.1000 = #1d4ed8
primitive.blue.1300 = #1e40af
primitive.blue.1700 = #1e3a8a
primitive.blue.2100 = #172554
```

---

## **1.3 Green**

```
primitive.green.50   = #f0fdf4
primitive.green.100  = #dcfce7
primitive.green.200  = #bbf7d0
primitive.green.300  = #86efac
primitive.green.400  = #4ade80
primitive.green.600  = #22c55e
primitive.green.800  = #16a34a
primitive.green.1000 = #15803d
primitive.green.1300 = #166534
primitive.green.1700 = #14532d
primitive.green.2100 = #052e16
```

---

## **1.4 Red**

```
primitive.red.50   = #fef2f2
primitive.red.100  = #fee2e2
primitive.red.200  = #fecaca
primitive.red.300  = #fca5a5
primitive.red.400  = #f87171
primitive.red.600  = #ef4444
primitive.red.800  = #dc2626
primitive.red.1000 = #b91c1c
primitive.red.1300 = #991b1b
primitive.red.1700 = #7f1d1d
primitive.red.2100 = #450a0a
```

---

## **1.5 Yellow**

```
primitive.yellow.50   = #fffbeb
primitive.yellow.100  = #fef3c7
primitive.yellow.200  = #fde68a
primitive.yellow.300  = #fcd34d
primitive.yellow.400  = #fbbf24
primitive.yellow.600  = #f59e0b
primitive.yellow.800  = #d97706
primitive.yellow.1000 = #b45309
primitive.yellow.1300 = #92400e
primitive.yellow.1700 = #78350f
primitive.yellow.2100 = #451a03
```

---

## **1.6 Purple**

```
primitive.purple.50   = #faf5ff
primitive.purple.100  = #f3e8ff
primitive.purple.200  = #e9d5ff
primitive.purple.300  = #d8b4fe
primitive.purple.400  = #c084fc
primitive.purple.600  = #a855f7
primitive.purple.800  = #9333ea
primitive.purple.1000 = #7e22ce
primitive.purple.1300 = #6b21a8
primitive.purple.1700 = #581c87
primitive.purple.2100 = #3b0764
```

---

# **2. Semantic Tokens**

## **Structure**

```
{group}.{category}.{importance}.{prominence}.{state}
```

---

## **2.1 Root Groups**

```
background.*
foreground.*
border.*
```

---

## **2.2 Base System Tokens (Non-Brandable)**

```
background.primary
background.secondary
background.tertiary
background.disabled

foreground.primary
foreground.secondary
foreground.tertiary
foreground.disabled

border.primary
border.secondary
border.tertiary
border.disabled
```

---

## **2.3 Foreground "On" Tokens**

```
foreground.on.primary
foreground.on.secondary
foreground.on.tertiary
```

Used for content placed on background surfaces.

---

# **3. Modes**

## **3.1 Light Mode**

```
background.primary   = primitive.gray.50
background.secondary = primitive.gray.100
background.tertiary  = primitive.gray.200

foreground.primary   = primitive.gray.1700
foreground.secondary = primitive.gray.1000
foreground.tertiary  = primitive.gray.600

border.primary       = primitive.gray.300
border.secondary     = primitive.gray.200
border.tertiary      = primitive.gray.100
```

---

## **3.2 Dark Mode**

```
background.primary   = primitive.gray.1700
background.secondary = primitive.gray.1300
background.tertiary  = primitive.gray.1000

foreground.primary   = primitive.gray.50
foreground.secondary = primitive.gray.300
foreground.tertiary  = primitive.gray.400

border.primary       = primitive.gray.800
border.secondary     = primitive.gray.1000
border.tertiary      = primitive.gray.1300
```

---

# **4. Brand Tokens**

## **Structure**

```
{group}.brand.{importance}.{prominence}.{state}
```

---

## **4.1 Importance Levels**

```
primary
secondary
tertiary
```

---

## **4.2 Prominence**

```
solid
soft
```

---

## **4.3 States**

```
base
hover
focus
```

---

## **4.4 Example**

```
background.brand.primary.solid.base  = primitive.blue.1000
background.brand.primary.solid.hover = primitive.blue.1300
background.brand.primary.solid.focus = primitive.blue.800

background.brand.primary.soft.base   = primitive.blue.100
```

---

# **5. Feedback Tokens**

## **Structure**

```
{group}.feedback.{type}.{prominence}.{state}
```

---

## **Types**

```
success → green
warning → yellow
error   → red
info    → blue
```

---

## **Example**

```
background.feedback.success.solid.base = primitive.green.1000
background.feedback.error.soft.base    = primitive.red.100
```

---

# **6. Control Tokens**

Used for inputs and interactive UI elements.

## **Structure**

```
{group}.control.{importance}.{state}
```

---

## **Example**

```
border.control.primary.base
border.control.primary.focus

background.control.primary.base
foreground.control.primary.disabled
```

---

# **7. Foreground “On” Mapping**

```
foreground.on.primary   = #ffffff
foreground.on.secondary = primitive.gray.1700
```

---

# **8. Usage Rules**

## **Allowed**

* Components must use **semantic tokens only**

---

## **Not Allowed**

* No direct primitive usage in components
* No hex values outside primitives
* No cross-group misuse:

  * background tokens on text
  * border tokens on surfaces

---

# **9. Example: Button**

## **Primary Button**

```
background → background.brand.primary.solid.base
hover      → background.brand.primary.solid.hover
focus      → background.brand.primary.solid.focus

text       → foreground.on.primary
border     → none
```

---

# **10. Implementation Notes**

## **Figma Setup**

### Collections:

* `primitive` (no modes)
* `semantic` (light / dark modes)

---

## **Naming Convention**

```
background.primary
foreground.primary
border.primary

background.brand.primary.solid.base
foreground.on.primary
```

---

This is clean enough to:

* paste into Figma variable planning
* feed into an agent
* start component migration immediately

---

If you want next, Keketso:

I can convert this into:

* **JSON token format (for dev handoff)**
* or a **Figma variable import-ready structure**

Which one are you feeding the agent?
