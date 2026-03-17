import React, { useState } from 'react';
import { Control, MediaPickerValue } from '../controls/types/index';
import RichTextEditor from '../../context/ElementorBuilderContext';

/**
 * ControlRenderer - Renders individual controls based on type
 * Supports: text, textarea, select, toggle, color, slider, number, dimensions,
 * border, shadow, typography, align, gap, mediapicker, link, icon, repeater, heading
 */

interface ControlRendererProps {
  control: Control;
  value: any;
  onChange: (value: any) => void;
  condition?: (value: any) => boolean;
}

export const ControlRenderer: React.FC<ControlRendererProps>=({
  control,
  value,
  onChange,
  condition,
}) => {
  // Check condition (show/hide)
  if (condition&&!condition(value)) {
    return null;
  }

  const renderControl=() => {
    const val=value!==undefined? value:control.default;

    switch (control.type) {
      // ===== TEXT =====
      case 'text':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <input
              type="text"
              value={val||''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={control.placeholder}
              maxLength={control.maxLength}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== TEXTAREA =====
      case 'textarea': {
        const isRichText=(control as any).richText===true;

        if (isRichText) {
          return (
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {control.label}
                {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
              </label>
              {(() => {
                const RTE=RichTextEditor as any;
                return (
                  <RTE
                    value={val||''}
                    onChange={(newValue: string) => onChange(newValue)}
                  />
                );
              })()}
              {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
            </div>
          );
        }

        // Regular textarea
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <textarea
              value={val||''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={control.placeholder}
              rows={control.rows||3}
              maxLength={control.maxLength}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );
      }

      // ===== SELECT =====
      case 'select':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <select
              value={String(val||'')}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {control.options?.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== TOGGLE =====
      case 'toggle':
        return (
          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={val||false}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs font-semibold text-gray-700">
                {control.label}
                {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
              </span>
            </label>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== COLOR =====
      case 'color':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={val||'#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={val||''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== SLIDER =====
      case 'slider':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step||1}
                value={val||control.min}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded cursor-pointer"
              />
              <input
                type="number"
                min={control.min}
                max={control.max}
                step={control.step||1}
                value={val||control.min}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {control.unit&&<span className="text-xs text-gray-900">{control.unit}</span>}
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== NUMBER =====
      case 'number':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={control.min}
                max={control.max}
                step={control.step||1}
                value={val||''}
                onChange={(e) => onChange(e.target.value? Number(e.target.value):'')}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {control.unit&&<span className="px-2 py-1.5 text-xs font-medium text-gray-600">{control.unit}</span>}
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== UNIT NUMBER (Value + Unit Selector) =====
      case 'unit-number': {
        const valueStr=typeof val==='string'? val:'';
        const parts=valueStr.match(/^([\d.-]*)(.*)$/);
        const numValue=parts? parts[1]:'';
        const extractedUnit=parts? parts[2].trim():'';
        const unit=extractedUnit||(control.defaultUnit||'px');
        const availableUnits=control.units||['px', 'rem', 'em', '%', 'vh', 'vw'];

        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={control.min}
                max={control.max}
                step={control.step||1}
                value={numValue}
                onChange={(e) => {
                  const newVal=e.target.value? `${e.target.value}${unit}`:'';
                  onChange(newVal);
                }}
                placeholder="Value"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => {
                  const newUnit=e.target.value;
                  const newVal=numValue? `${numValue}${newUnit}`:newUnit;
                  onChange(newVal);
                }}
                className="px-2 py-1.5 border border-gray-300 rounded text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableUnits.map((u: string) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );
      }

      // ===== ALIGNMENT =====
      case 'align':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="flex gap-1">
              {control.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange(opt)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition ${val===opt
                    ? 'bg-blue-600 text-white'
                    :'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  title={opt}
                >
                  {getAlignmentIcon(opt)}
                </button>
              ))}
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== DIMENSIONS (Padding/Margin) =====
      case 'dimensions':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Top</label>
                <input
                  type="number"
                  value={val?.top||''}
                  onChange={(e) => onChange({ ...val, top: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Right</label>
                <input
                  type="number"
                  value={val?.right||''}
                  onChange={(e) => onChange({ ...val, right: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Bottom</label>
                <input
                  type="number"
                  value={val?.bottom||''}
                  onChange={(e) => onChange({ ...val, bottom: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Left</label>
                <input
                  type="number"
                  value={val?.left||''}
                  onChange={(e) => onChange({ ...val, left: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== TYPOGRAPHY =====
      case 'typography':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="space-y-2 border border-gray-200 rounded p-2 bg-gray-50">
              {control.includeFontFamily!==false&&(
                <input
                  type="text"
                  value={val?.fontFamily||''}
                  onChange={(e) => onChange({ ...val, fontFamily: e.target.value })}
                  placeholder="Font Family"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {control.includeFontWeight!==false&&(
                <select
                  value={val?.fontWeight||400}
                  onChange={(e) => onChange({ ...val, fontWeight: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={300}>Light (300)</option>
                  <option value={400}>Normal (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>Semibold (600)</option>
                  <option value={700}>Bold (700)</option>
                  <option value={800}>Extrabold (800)</option>
                </select>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={val?.fontSize||''}
                  onChange={(e) => onChange({ ...val, fontSize: e.target.value })}
                  placeholder="Font Size"
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {control.includeLineHeight!==false&&(
                  <input
                    type="number"
                    value={val?.lineHeight||''}
                    onChange={(e) => onChange({ ...val, lineHeight: e.target.value })}
                    placeholder="Line Height"
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              {control.includeLetterSpacing!==false&&(
                <input
                  type="number"
                  value={val?.letterSpacing||''}
                  onChange={(e) => onChange({ ...val, letterSpacing: e.target.value })}
                  placeholder="Letter Spacing"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {control.includeTextTransform!==false&&(
                <select
                  value={val?.textTransform||'none'}
                  onChange={(e) => onChange({ ...val, textTransform: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="uppercase">Uppercase</option>
                  <option value="lowercase">Lowercase</option>
                  <option value="capitalize">Capitalize</option>
                </select>
              )}
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== BORDER =====
      case 'border':
        // Initialize with empty object if not set
        const borderVal=val||{};
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="space-y-2 border border-gray-200 rounded p-2 bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={borderVal?.width||''}
                  onChange={(e) => onChange({ ...borderVal, width: e.target.value })}
                  placeholder="Width"
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={borderVal?.style||'solid'}
                  onChange={(e) => onChange({ ...borderVal, style: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
              <input
                type="color"
                value={borderVal?.color||'#000000'}
                onChange={(e) => onChange({ ...borderVal, color: e.target.value })}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="number"
                value={borderVal?.radius||''}
                onChange={(e) => onChange({ ...borderVal, radius: e.target.value })}
                placeholder="Radius"
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== SHADOW =====
      case 'shadow':
        // Initialize with empty object if not set
        const shadowVal=val||{};
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="space-y-2 border border-gray-200 rounded p-2 bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={shadowVal?.offsetX||''}
                  onChange={(e) => onChange({ ...shadowVal, offsetX: e.target.value })}
                  placeholder="Offset X"
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={shadowVal?.offsetY||''}
                  onChange={(e) => onChange({ ...shadowVal, offsetY: e.target.value })}
                  placeholder="Offset Y"
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={shadowVal?.blur||''}
                  onChange={(e) => onChange({ ...shadowVal, blur: e.target.value })}
                  placeholder="Blur"
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={shadowVal?.spread||''}
                  onChange={(e) => onChange({ ...shadowVal, spread: e.target.value })}
                  placeholder="Spread"
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="color"
                value={shadowVal?.color||'#000000'}
                onChange={(e) => onChange({ ...shadowVal, color: e.target.value })}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== MEDIA PICKER =====
      case 'mediapicker':
        return (
          <MediaPickerControl
            value={val}
            onChange={onChange}
            label={control.label}
            help={control.help}
            accept={control.accept}
            responsive={control.responsive}
          />
        );

      // ===== HEADING (Section divider) =====
      case 'heading':
        return (
          <div className="mb-3 pt-2 pb-2 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              {control.label}
            </h4>
          </div>
        );

      // ===== BUTTON GROUP =====
      case 'buttongroup':
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>
            <div className="flex gap-2">
              {control.options?.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                  }}
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition ${val===opt.value
                    ? 'bg-blue-500 text-white shadow-md'
                    :'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  title={opt.label}
                >
                  {opt.icon&&<i className={`fas ${opt.icon} mr-1`}></i>}
                  {opt.label}
                </button>
              ))}
            </div>
            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );

      // ===== REPEATER =====
      case 'repeater': {
        const [selectedIndex, setSelectedIndex]=useState<number|null>(null);
        const items=Array.isArray(val)? val:(control.default||[]);

        const addItem=() => {
          const newItem: any={};
          (control as any).fields?.forEach((field: any) => {
            newItem[field.name]=field.default||'';
          });
          onChange([...items, newItem]);
        };

        const deleteItem=(index: number) => {
          onChange(items.filter((_: any, i: number) => i!==index));
          setSelectedIndex(null);
        };

        const updateItem=(index: number, fieldName: string, fieldValue: any) => {
          const updated=[...items];
          updated[index]={ ...updated[index], [fieldName]: fieldValue };
          onChange(updated);
        };

        return (
          <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">{control.label}</h3>

              {/* Items List */}
              <div className="space-y-2 mb-3">
                {items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 border rounded cursor-pointer transition ${selectedIndex===index
                      ? 'border-blue-500 bg-blue-50'
                      :'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedIndex(selectedIndex===index? null:index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-700">
                          Item {index+1}
                          {item.icon&&<span className="ml-2 text-sm">{item.icon}</span>}
                          {item.heading&&<span className="ml-2 text-gray-600">{item.heading}</span>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(index);
                        }}
                        className="text-black hover:text-gray-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Item Details Editor */}
                    {selectedIndex===index&&(
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                        {(control as any).fields?.map((field: any) => (
                          <div key={field.name} onClick={(e) => e.stopPropagation()}>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              {field.label}
                            </label>
                            {field.type==='icon'&&(
                              <input
                                type="text"
                                value={item[field.name]||''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateItem(index, field.name, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="fas fa-check"
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                            {field.type==='text'&&(
                              <input
                                type="text"
                                value={item[field.name]||''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateItem(index, field.name, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={field.placeholder||field.label}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                            {field.type==='textarea'&&(
                              <textarea
                                value={item[field.name]||''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateItem(index, field.name, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={field.placeholder||field.label}
                                rows={2}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                            {field.type==='toggle'&&(
                              <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={item[field.name]||false}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateItem(index, field.name, e.target.checked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-xs text-gray-600">{field.label}</span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button
                onClick={addItem}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition"
              >
                + Add Item
              </button>
            </div>
            {control.help&&<div className="p-3 bg-blue-50 text-xs text-blue-700">{control.help}</div>}
          </div>
        );
      }

      // ===== ICON PICKER =====
      case 'icon': {
        const commonIcons=[
          // Basic
          'fas fa-star',
          'fas fa-heart',
          'fas fa-check',
          'fas fa-times',
          'fas fa-plus',
          'fas fa-minus',
          'fas fa-search',
          'fas fa-user',
          'fas fa-bell',
          'fas fa-cog',
          'fas fa-phone',
          'fas fa-envelope',
          'fas fa-home',
          'fas fa-shopping-cart',
          'fas fa-arrow-right',
          'fas fa-arrow-left',
          'fas fa-arrow-up',
          'fas fa-arrow-down',
          'fas fa-calendar',
          'fas fa-clock',
          'fas fa-camera',
          'fas fa-image',
          'fas fa-video',
          'fas fa-music',
          'fas fa-file',
          'fas fa-folder',
          'fas fa-link',
          'fas fa-share',
          'fas fa-download',
          'fas fa-upload',
          // Social
          'fab fa-facebook',
          'fab fa-twitter',
          'fab fa-linkedin',
          'fab fa-instagram',
          'fab fa-youtube',
          'fab fa-github',
          'fab fa-whatsapp',
          'fab fa-telegram',
          // More icons
          'fas fa-bars',
          'fas fa-trash',
          'fas fa-edit',
          'fas fa-eye',
          'fas fa-globe',
          'fas fa-map',
          'fas fa-star-half',
          'fas fa-flag',
          'fas fa-rocket',
          'fas fa-certificate',
          'fas fa-crown',
          'fas fa-gift',
          'fas fa-lock',
          'fas fa-unlock',
          'fas fa-key',
          'fas fa-battery-full',
          'fas fa-wifi',
          'fas fa-sun',
          'fas fa-moon',
          'fas fa-cloud',
          'fas fa-leaf',
          'fas fa-fire',
        ];

        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {control.label}
              {control.responsive&&<span className="text-blue-500 ml-1">📱</span>}
            </label>

            {/* Custom icon input - more prominent */}
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs font-semibold text-blue-700 mb-2">📝 Custom FontAwesome Code</p>
              <input
                type="text"
                value={val||''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g., fas fa-star, fab fa-facebook"
                className="w-full px-2 py-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-blue-600 mt-1">Type any FontAwesome class name</p>
            </div>

            {/* Display current selection */}
            {val&&(
              <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded flex items-center gap-2">
                <span className="text-3xl text-gray-400">
                  <i className={val}></i>
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Selected:</p>
                  <p className="text-sm text-gray-400 font-mono">{val}</p>
                </div>
              </div>
            )}

            {/* Icon Grid Library */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Or Select from Library:</p>
              <div className="grid grid-cols-6 gap-2 p-2 border border-gray-300 rounded bg-gray-50 max-h-64 overflow-y-auto">
                {commonIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => onChange(icon)}
                    className={`p-2 rounded text-lg transition ${val===icon
                        ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-400'
                        :'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-400'
                      }`}
                    title={icon}
                  >
                    <i className={icon}></i>
                  </button>
                ))}
              </div>
            </div>

            {control.help&&<p className="text-xs text-gray-900 mt-1">{control.help}</p>}
          </div>
        );
      }

        return <div className="text-xs text-black mb-3">Unknown control type: {control.type}</div>;
    }
  };

  return <>{renderControl()}</>;
};

// ============================================================================
// MEDIA PICKER CONTROL
// ============================================================================

interface MediaPickerControlProps {
  value: MediaPickerValue|string|undefined;
  onChange: (value: MediaPickerValue|string|undefined) => void;
  label: string;
  help?: string;
  accept?: 'image'|'video'|'all';
  responsive?: boolean;
}

const MediaPickerControl: React.FC<MediaPickerControlProps>=({
  value,
  onChange,
  label,
  help,
  accept='all',
  responsive,
}) => {
  const [showLibrary, setShowLibrary]=useState(false);
  const [useUrl, setUseUrl]=useState(false);
  const [urlInput, setUrlInput]=useState('');
  const [isUploading, setIsUploading]=useState(false);

  const handleUpload=async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData=new FormData();
      formData.append('file', file);

      const response=await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data=await response.json();
        // Extract URL from response - could be nested in asset object or direct
        const uploadedUrl=data.asset?.url||data.url||data.path||file.name;
        onChange(uploadedUrl);
      } else {
alert('Upload failed. Please try again.');
      }
    } catch (error) {
alert('Upload error. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit=() => {
    if (urlInput.trim()) {
      onChange(urlInput as string);
      setUrlInput('');
      setUseUrl(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
        {responsive&&<span className="text-blue-500 ml-1">📱</span>}
      </label>

      <div className="border border-gray-300 rounded p-2 bg-gray-50">
        {value? (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl overflow-hidden">
              {typeof value==='string'&&(value as string).startsWith?.('http')? (
                <img src={value as string} alt="preview" className="w-full h-full object-cover" />
              ):(
                accept==='video'||(value as any)?.type==='video'? '🎥':'🖼️'
              )}
            </div>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-gray-700 truncate">
                {typeof value==='string'? (
                  // Extract filename from URL or show clean title
                  (value as string).includes('/')
                    ? (value as string).split('/').pop()?.split('?')[0]||'Media File'
                    :(value as string)
                ):(value as any)?.filename||(value as any)?.assetId}
              </p>
              <p className="text-gray-600">{typeof value==='string'? 'URL':'Asset'}</p>
            </div>
            <button
              onClick={() => onChange(undefined)}
              className="p-1 hover:bg-gray-100 rounded text-black"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ):(
          <div className="text-center py-4 text-gray-900">
            <p className="text-2xl mb-1">📁</p>
            <p className="text-xs">No media selected</p>
          </div>
        )}

        {!useUrl? (
          <div className="flex gap-2">
            <label className={`flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded cursor-pointer transition text-center ${isUploading? 'opacity-50 cursor-not-allowed':''}`}>
              {isUploading? 'Uploading...':'Upload'}
              <input
                type="file"
                onChange={handleUpload}
                disabled={isUploading}
                accept={accept==='all'? 'image/*,video/*':accept==='image'? 'image/*':'video/*'}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setUseUrl(true)}
              className="flex-1 px-2 py-1.5 bg-black hover:bg-black text-white text-xs font-medium rounded transition"
            >
              URL
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-700 text-white text-xs font-medium rounded transition"
            >
              Library
            </button>
          </div>
        ):(
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-gray-500"
              onKeyPress={(e) => e.key==='Enter'&&handleUrlSubmit()}
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-1.5 bg-black hover:bg-black text-white text-xs font-medium rounded transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setUseUrl(false);
                setUrlInput('');
              }}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-700 text-white text-xs font-medium rounded transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {help&&<p className="text-xs text-gray-900 mt-1">{help}</p>}

      {showLibrary&&(
        <MediaLibraryModal
          onSelect={(assetId, _type) => {
            onChange(assetId as string);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
          accept={accept}
        />
      )}
    </div>
  );
};

// ============================================================================
// MEDIA LIBRARY MODAL
// ============================================================================

interface MediaLibraryModalProps {
  onSelect: (assetId: string, type: 'image'|'video') => void;
  onClose: () => void;
  accept?: 'image'|'video'|'all';
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps>=({
  onSelect,
  onClose,
  accept='all',
}) => {
  // TODO: Implement actual media library fetching from /api/media
  const mockAssets=[
    { _id: '1', type: 'image', filename: 'photo1.jpg', url: '/api/media/serve/1' },
    { _id: '2', type: 'image', filename: 'photo2.jpg', url: '/api/media/serve/2' },
    { _id: '3', type: 'video', filename: 'video1.mp4', url: '/api/media/serve/3' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-gray-800">Select Media</h2>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3">
          {mockAssets
            .filter(
              (asset) =>
                accept==='all'||
                (accept==='image'&&asset.type==='image')||
                (accept==='video'&&asset.type==='video')
            )
            .map((asset) => (
              <button
                key={asset._id}
                onClick={() => onSelect(asset._id, asset.type as any)}
                className="p-2 border border-gray-300 rounded hover:border-blue-500 transition text-left"
              >
                <div className="w-full aspect-square bg-gray-200 rounded flex items-center justify-center text-3xl mb-1">
                  {asset.type==='image'? '🖼️':'🎥'}
                </div>
                <p className="text-xs font-semibold text-gray-700 truncate">{asset.filename}</p>
              </button>
            ))}
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getAlignmentIcon=(alignment: string): string => {
  switch (alignment) {
    case 'left':
      return '⬅️';
    case 'center':
      return '⬅️➡️';
    case 'right':
      return '➡️';
    case 'justify':
      return '⬅️⬅️➡️';
    case 'flex-start':
      return '↖️';
    case 'flex-end':
      return '↘️';
    case 'space-between':
      return '⬅️  ➡️';
    default:
      return alignment;
  }
};

export default ControlRenderer;
