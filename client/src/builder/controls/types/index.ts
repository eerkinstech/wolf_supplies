/**
 * Control Types - Comprehensive type definitions for all Elementor-like controls
 * Supports: Text, Textarea, Select, Toggle, Color, Slider, Number, Dimensions,
 * Border, Shadow, Typography, Alignment, Gap, MediaPicker, Link, IconPicker, Repeater
 */

// ============================================================================
// CONTROL TYPE UNION
// ============================================================================

export type ControlType=
  |'text'
  |'textarea'
  |'select'
  |'toggle'
  |'color'
  |'slider'
  |'number'
  |'unit-number'
  |'dimensions'
  |'border'
  |'shadow'
  |'typography'
  |'align'
  |'gap'
  |'buttongroup'
  |'mediapicker'
  |'link'
  |'icon'
  |'repeater'
  |'heading';

// ============================================================================
// BASE CONTROL
// ============================================================================

export interface ControlOption {
  label: string;
  value: string|number|boolean;
}

export interface BaseControl {
  name: string;
  label: string;
  type: ControlType;
  help?: string;
  default?: any;
  responsive?: boolean; // Can have different values per device
  condition?: (nodeProps: any) => boolean; // Show/hide based on other props
}

// ============================================================================
// SPECIFIC CONTROL TYPES
// ============================================================================

export interface TextControl extends BaseControl {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
}

export interface TextareaControl extends BaseControl {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  richText?: boolean; // Enable rich text editor (bold, italic, link, etc.)
}

export interface SelectControl extends BaseControl {
  type: 'select';
  options: ControlOption[];
  multiple?: boolean;
  searchable?: boolean;
}

export interface ToggleControl extends BaseControl {
  type: 'toggle';
}

export interface ColorControl extends BaseControl {
  type: 'color';
  alpha?: boolean; // Support transparency
}

export interface SliderControl extends BaseControl {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  unit?: string; // 'px', '%', 'em', etc.
  marks?: number[]; // Visual markers on slider
}

export interface NumberControl extends BaseControl {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string; // 'px', '%', 'em', etc.
}

export interface UnitNumberControl extends BaseControl {
  type: 'unit-number';
  min?: number;
  max?: number;
  step?: number;
  units?: string[]; // Available units: 'px', 'rem', 'em', '%', 'vh', 'vw', etc.
  defaultUnit?: string; // Default unit when value is entered
}

export interface AlignmentControl extends BaseControl {
  type: 'align';
  options: Array<'left'|'center'|'right'|'justify'|'flex-start'|'center'|'flex-end'|'space-between'>;
}

export interface GapControl extends BaseControl {
  type: 'gap';
  min?: number;
  max?: number;
  unit?: string;
}

export interface ButtonGroupOption {
  label: string;
  value: string|number|boolean;
  icon?: string; // Icon class (e.g., 'fa-arrow-down')
}

export interface ButtonGroupControl extends BaseControl {
  type: 'buttongroup';
  options: ButtonGroupOption[];
}

// ============================================================================
// COMPLEX CONTROLS
// ============================================================================

export interface DimensionsValue {
  top?: string|number;
  right?: string|number;
  bottom?: string|number;
  left?: string|number;
}

export interface DimensionsControl extends BaseControl {
  type: 'dimensions';
  unit?: string; // 'px', 'rem', '%'
  min?: number;
  max?: number;
  linkedByDefault?: boolean; // Link all 4 sides
}

export interface BorderValue {
  width?: string|number;
  style?: 'solid'|'dashed'|'dotted'|'double'|'groove'|'ridge'|'inset'|'outset'|'none';
  color?: string;
  radius?: string|number; // border-radius
}

export interface BorderControl extends BaseControl {
  type: 'border';
  unit?: string;
}

export interface ShadowValue {
  offsetX?: string|number;
  offsetY?: string|number;
  blur?: string|number;
  spread?: string|number;
  color?: string;
  inset?: boolean;
}

export interface ShadowControl extends BaseControl {
  type: 'shadow';
  unit?: string;
}

export interface TypographyValue {
  fontFamily?: string;
  fontSize?: string|number;
  fontWeight?: string|number;
  lineHeight?: string|number;
  letterSpacing?: string|number;
  textTransform?: 'none'|'uppercase'|'lowercase'|'capitalize';
}

export interface TypographyControl extends BaseControl {
  type: 'typography';
  includeFontFamily?: boolean;
  includeFontWeight?: boolean;
  includeLineHeight?: boolean;
  includeLetterSpacing?: boolean;
  includeTextTransform?: boolean;
}

// ============================================================================
// MEDIA PICKER
// ============================================================================

export interface MediaPickerValue {
  assetId: string; // Reference to MediaAsset._id
  type: 'image'|'video';
  alt?: string; // Alternative text for images
  posterAssetId?: string; // For videos: thumbnail image
}

export interface MediaPickerControl extends BaseControl {
  type: 'mediapicker';
  accept?: 'image'|'video'|'all';
  multiple?: boolean; // For gallery-like controls
}

// ============================================================================
// LINK CONTROL
// ============================================================================

export interface LinkValue {
  url: string;
  target?: '_self'|'_blank'|'_parent'|'_top';
  rel?: string;
  nofollow?: boolean;
}

export interface LinkControl extends BaseControl {
  type: 'link';
  showTarget?: boolean;
  showRel?: boolean;
}

// ============================================================================
// ICON PICKER
// ============================================================================

export interface IconControl extends BaseControl {
  type: 'icon';
  library?: 'fa'|'heroicons'|'feather'|'all'; // Icon library to use
}

// ============================================================================
// REPEATER (array of grouped controls)
// ============================================================================

export interface RepeaterItemControl {
  name: string;
  label: string;
  type: ControlType;
  help?: string;
  default?: any;
  accept?: 'image'|'video'|'all'; // For mediapicker
  placeholder?: string; // For text/textarea
  rows?: number; // For textarea
  options?: ControlOption[]; // For select
  min?: number; // For slider/number
  max?: number; // For slider/number
  step?: number; // For slider/number
  unit?: string; // For number/slider/dimensions
  // ... other control props
}

export interface RepeaterControl extends BaseControl {
  type: 'repeater';
  controls: RepeaterItemControl[];
  minItems?: number;
  maxItems?: number;
  defaultItems?: any[]; // Default item structure
}

// ============================================================================
// HEADING (Section separator)
// ============================================================================

export interface HeadingControl extends BaseControl {
  type: 'heading';
  // Just a visual divider, no value
}

// ============================================================================
// CONTROL UNION
// ============================================================================

export type Control=
  |TextControl
  |TextareaControl
  |SelectControl
  |ToggleControl
  |ColorControl
  |SliderControl
  |NumberControl
  |UnitNumberControl
  |AlignmentControl
  |GapControl
  |ButtonGroupControl
  |DimensionsControl
  |BorderControl
  |ShadowControl
  |TypographyControl
  |MediaPickerControl
  |LinkControl
  |IconControl
  |RepeaterControl
  |HeadingControl;

// ============================================================================
// CONTROL GROUPS
// ============================================================================

export interface ControlGroup {
  groupName?: string; // Optional section title
  controls: Control[];
}

// ============================================================================
// WIDGET CONTROLS SCHEMA
// ============================================================================

export interface WidgetControls {
  content: Control[];
  style: Control[];
  advanced: Control[];
}

// ============================================================================
// NODE STRUCTURE
// ============================================================================

export interface Node {
  id: string;
  kind: 'root'|'section'|'column'|'widget';
  widgetType?: string; // e.g., 'heading', 'text', 'image', 'productCard', etc.
  children?: Node[];

  props: Record<string, any>; // CONTENT tab
  style: Record<string, any>; // STYLE tab
  advanced: Record<string, any>; // ADVANCED tab

  responsive?: {
    desktop?: {
      style?: Record<string, any>;
      advanced?: Record<string, any>;
    };
    tablet?: {
      style?: Record<string, any>;
      advanced?: Record<string, any>;
    };
    mobile?: {
      style?: Record<string, any>;
      advanced?: Record<string, any>;
    };
  };
}

// ============================================================================
// MEDIA ASSET (Backend)
// ============================================================================

export interface MediaAsset {
  _id: string;
  type: 'image'|'video';
  filename: string;
  mime: string;
  size: number;
  storageKeyOrPath: string;
  url: string; // Server-generated URL
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // seconds, for videos
  createdAt: Date;
}

// ============================================================================
// INSPECTOR PROPS
// ============================================================================

export type InspectorTab='content'|'style'|'advanced';

export interface InspectorProps {
  selectedNodeId: string|null;
  onBack: () => void;
}
