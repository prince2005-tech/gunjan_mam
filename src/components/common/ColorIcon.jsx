import React from 'react';

/**
 * WasteWise High-Resolution Colourful Illustrated Icon Family
 * Inspired by the clean, friendly, vibrant illustrated icon aesthetic
 * of municipal smart dashboards (matching the attached reference).
 */

export default function ColorIcon({ name, className = 'w-5 h-5', style = {} }) {
  const iconName = String(name || '').toLowerCase();

  switch (iconName) {
    case 'dashboard':
    case 'home':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* House icon: Red gable roof, chimney, warm tan walls, blue window, wooden door */}
          <rect x="23" y="6" width="3.5" height="7" rx="1" fill="#92400E" />
          <path d="M18 4L4 16.5C3.3 17.1 3.7 18 4.6 18H7V30C7 31.1 7.9 32 9 32H27C28.1 32 29 31.1 29 30V18H31.4C32.3 18 32.7 17.1 32 16.5L18 4Z" fill="#DC2626" />
          <path d="M7 17H29V30C29 31.1 28.1 32 27 32H9C7.9 32 7 31.1 7 30V17Z" fill="#FDF6B2" />
          <path d="M18 4L6 14.5L7 17H29L30 14.5L18 4Z" fill="#B91C1C" />
          <rect x="15" y="21" width="6" height="11" rx="1" fill="#B45309" />
          <circle cx="19.5" cy="26.5" r="0.75" fill="#FEF08A" />
          <rect x="10" y="20" width="3.5" height="4" rx="0.5" fill="#38BDF8" />
          <rect x="22.5" y="20" width="3.5" height="4" rx="0.5" fill="#38BDF8" />
        </svg>
      );

    case 'bins':
    case 'bin':
    case 'waste':
    case 'trash':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wire Mesh Dustbin matching reference: Rolled silver rim, diamond mesh body, solid base */}
          <ellipse cx="18" cy="8" rx="11" ry="3.5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.2" />
          <ellipse cx="18" cy="8" rx="8.5" ry="2.2" fill="#475569" opacity="0.4" />
          {/* Tapered basket body */}
          <path d="M8 8.5L11.5 30C11.7 31.1 14.5 32 18 32C21.5 32 24.3 31.1 24.5 30L28 8.5" fill="#94A3B8" opacity="0.25" />
          {/* Diagonal mesh lattice */}
          <path d="M10 11L24 29M14 9L26 25M7 15L21 31M26 11L12 29M22 9L10 25M29 15L15 31" stroke="#64748B" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          {/* Vertical and contour wire ribs */}
          <path d="M8 8.5L11.5 30C11.7 31.1 14.5 32 18 32C21.5 32 24.3 31.1 24.5 30L28 8.5" stroke="#475569" strokeWidth="1.3" />
          <ellipse cx="18" cy="8" rx="11" ry="3.2" fill="none" stroke="#F1F5F9" strokeWidth="1.2" />
          <ellipse cx="18" cy="30" rx="6.5" ry="1.8" fill="#334155" />
        </svg>
      );

    case 'truck':
    case 'trucks':
    case 'fleet':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Garbage / Municipal Green Truck matching reference */}
          {/* White Driver Cab */}
          <path d="M22 14H28C29.7 14 31.2 15.1 31.7 16.7L33.4 22.3C33.8 23.5 34 24.7 34 26V28C34 28.6 33.6 29 33 29H22V14Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="0.8" />
          {/* Cab Window */}
          <path d="M24 16H28C28.8 16 29.5 16.5 29.8 17.3L31.2 21H24V16Z" fill="#38BDF8" />
          {/* Municipal Green Cargo Box */}
          <rect x="2" y="9" width="20" height="20" rx="2" fill="#16834A" stroke="#14532D" strokeWidth="0.8" />
          {/* Cargo Body Highlights & Ribs */}
          <rect x="4" y="11" width="16" height="4" rx="1" fill="#22C55E" opacity="0.5" />
          <line x1="8" y1="17" x2="8" y2="27" stroke="#14532D" strokeWidth="0.8" strokeDasharray="1 1" />
          <line x1="14" y1="17" x2="14" y2="27" stroke="#14532D" strokeWidth="0.8" strokeDasharray="1 1" />
          {/* Small Recycling logo on truck cargo */}
          <circle cx="11" cy="22" r="2.5" fill="#14532D" opacity="0.4" />
          {/* Chassis */}
          <rect x="5" y="28.5" width="27" height="2" fill="#334155" />
          {/* Wheels */}
          <circle cx="9" cy="29.5" r="3.5" fill="#0F172A" />
          <circle cx="9" cy="29.5" r="1.5" fill="#94A3B8" />
          <circle cx="28" cy="29.5" r="3.5" fill="#0F172A" />
          <circle cx="28" cy="29.5" r="1.5" fill="#94A3B8" />
          {/* Headlight */}
          <circle cx="33" cy="25" r="1" fill="#FBBF24" />
        </svg>
      );

    case 'map':
    case 'collectionmap':
    case 'interactivemap':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Folded Map with road lines and location marker */}
          {/* Panel 1 */}
          <path d="M3 8.5L12 5V27.5L3 31V8.5Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Panel 2 */}
          <path d="M12 5L22 8.5V31L12 27.5V5Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Panel 3 */}
          <path d="M22 8.5L33 5V27.5L22 31V8.5Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />
          {/* Terrain & Rivers */}
          <path d="M5 14C8 13 10 16 12 15C15 13 18 17 22 15C26 13 29 16 31 14" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 23C10 20 16 26 22 21C26 18 28 22 30 20" stroke="#16834A" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 1.5" />
          {/* Map Pin */}
          <g filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.2))">
            <path d="M22 10C22 7.8 20.2 6 18 6C15.8 6 14 7.8 14 10C14 13.5 18 18 18 18C18 18 22 13.5 22 10Z" fill="#EF4444" />
            <circle cx="18" cy="10" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>
      );

    case 'optimization':
    case 'route':
    case 'dispatch':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Optimization: Connected routing node with gear and dynamic directional flow */}
          <rect x="4" y="4" width="28" height="28" rx="8" fill="#ECFDF5" />
          <path d="M9 25C11 18 16 14 20 18C23 21 25 15 27 11" stroke="#16834A" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
          {/* Start node */}
          <circle cx="9" cy="25" r="3.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Middle waypoint */}
          <circle cx="20" cy="18" r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* End Target Pin */}
          <circle cx="27" cy="11" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Arrow */}
          <path d="M24 10H28V14" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'network':
    case 'mst':
    case 'roadnetwork':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Road Network & MST Junctions */}
          <rect x="4" y="4" width="28" height="28" rx="8" fill="#F0FDF4" />
          <line x1="9" y1="18" x2="18" y2="9" stroke="#16834A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="18" y1="9" x2="27" y2="18" stroke="#16834A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="18" y1="9" x2="18" y2="27" stroke="#16834A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="9" y1="18" x2="18" y2="27" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
          <line x1="27" y1="18" x2="18" y2="27" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
          {/* Depot Node */}
          <circle cx="18" cy="9" r="4.5" fill="#16834A" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="18" cy="9" r="1.5" fill="#FFFFFF" />
          {/* Junction Nodes */}
          <circle cx="9" cy="18" r="3.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="27" cy="18" r="3.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="18" cy="27" r="3.5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );

    case 'analytics':
    case 'chart':
    case 'benchmark':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Colorful 3D Bar Chart with upward trend */}
          <rect x="4" y="4" width="28" height="28" rx="8" fill="#F8FAFC" />
          <line x1="7" y1="28" x2="29" y2="28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Bar 1 (Red/Amber) */}
          <rect x="8" y="19" width="4.5" height="9" rx="1.5" fill="#F59E0B" />
          {/* Bar 2 (Blue) */}
          <rect x="15" y="13" width="4.5" height="15" rx="1.5" fill="#0284C7" />
          {/* Bar 3 (Green) */}
          <rect x="22" y="8" width="4.5" height="20" rx="1.5" fill="#16834A" />
          {/* Upward Line & Arrow */}
          <path d="M9 16L17 11L25 6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 6H26V10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'calendar':
    case 'cycle':
    case 'date':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Calendar with spiral binder and red header */}
          <rect x="5" y="7" width="26" height="24" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M5 11C5 8.8 6.8 7 9 7H27C29.2 7 31 8.8 31 11V14H5V11Z" fill="#DC2626" />
          {/* Binder Rings */}
          <rect x="9" y="4.5" width="2.5" height="5" rx="1" fill="#64748B" />
          <rect x="17" y="4.5" width="2.5" height="5" rx="1" fill="#64748B" />
          <rect x="25" y="4.5" width="2.5" height="5" rx="1" fill="#64748B" />
          {/* Date Grid dots */}
          <circle cx="10" cy="19" r="1.5" fill="#94A3B8" />
          <circle cx="16" cy="19" r="1.5" fill="#94A3B8" />
          <circle cx="22" cy="19" r="1.5" fill="#94A3B8" />
          <circle cx="26" cy="19" r="1.5" fill="#94A3B8" />
          <circle cx="10" cy="25" r="1.5" fill="#94A3B8" />
          <circle cx="16" cy="25" r="2" fill="#16834A" />
          <circle cx="22" cy="25" r="1.5" fill="#94A3B8" />
          <circle cx="26" cy="25" r="1.5" fill="#94A3B8" />
        </svg>
      );

    case 'recycle':
    case 'collected':
    case 'recycling':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 3-Arrow Möbius Recycling Symbol matching reference */}
          <g transform="translate(18, 18) scale(0.9) translate(-18, -18)">
            {/* Top folded arrow */}
            <path d="M18 4L22.5 11.5H19.5C19.5 15.5 17 18 13.5 19L11.5 16C14 15 15.5 13.5 15.5 11.5H13.5L18 4Z" fill="#16834A" />
            {/* Bottom-right folded arrow */}
            <path d="M30 24L22.5 28.5L24 25.9C20.5 27.9 17 26.5 14 24.5L16 22C18.5 23.5 21 24.5 23 23.5L21.5 21L30 24Z" fill="#22C55E" />
            {/* Bottom-left folded arrow */}
            <path d="M6 24L10.5 16.5L12 19.1C15.5 17.1 19 18.5 22 20.5L20 23C17.5 21.5 15 20.5 13 21.5L14.5 24L6 24Z" fill="#15803D" />
          </g>
        </svg>
      );

    case 'hourglass':
    case 'pending':
    case 'waiting':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Classic Wooden Hourglass with amber sand */}
          <rect x="7" y="4" width="22" height="3.5" rx="1.5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
          <rect x="7" y="28.5" width="22" height="3.5" rx="1.5" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
          {/* Glass Bulbs */}
          <path d="M9.5 7.5H26.5C26.5 13.5 21 16 19 18C21 20 26.5 22.5 26.5 28.5H9.5C9.5 22.5 15 20 17 18C15 16 9.5 13.5 9.5 7.5Z" fill="#E0F2FE" stroke="#94A3B8" strokeWidth="1" opacity="0.8" />
          {/* Sand in top bulb */}
          <path d="M12 10H24C24 13 20 15 18 16C16 15 12 13 12 10Z" fill="#F59E0B" />
          {/* Trickling sand stream */}
          <line x1="18" y1="16" x2="18" y2="24" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          {/* Sand pile in bottom bulb */}
          <path d="M13 28H23C23 25 20 23 18 23C16 23 13 25 13 28Z" fill="#D97706" />
          {/* Glass glare highlight */}
          <path d="M11 10C11.5 12.5 13.5 14 15 14.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </svg>
      );

    case 'scale':
    case 'weight':
    case 'payload':
    case 'capacity':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Brass Balance Scale for weight & payload capacity */}
          <path d="M18 6V30" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <line x1="11" y1="30" x2="25" y2="30" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="7" y1="10" x2="29" y2="10" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="8" r="2.5" fill="#F59E0B" />
          {/* Left Pan */}
          <path d="M7 10L4 18H14L11 10" stroke="#B45309" strokeWidth="1" />
          <path d="M4 18C4 20.5 6.2 22 9 22C11.8 22 14 20.5 14 18H4Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          {/* Right Pan */}
          <path d="M25 10L22 18H32L29 10" stroke="#B45309" strokeWidth="1" />
          <path d="M22 18C22 20.5 24.2 22 27 22C29.8 22 32 20.5 32 18H22Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        </svg>
      );

    case 'check':
    case 'success':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="14" fill="#22C55E" />
          <path d="M11 18.5L15.5 23L25 13.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'warning':
    case 'alert':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 4L32 29C32.4 29.8 31.8 31 30.9 31H5.1C4.2 31 3.6 29.8 4 29L18 4Z" fill="#F59E0B" />
          <rect x="16.5" y="14" width="3" height="8" rx="1.5" fill="#FFFFFF" />
          <circle cx="18" cy="26" r="1.8" fill="#FFFFFF" />
        </svg>
      );

    case 'clipboard':
    case 'assignments':
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="8" width="24" height="24" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
          <rect x="13" y="4" width="10" height="5" rx="1.5" fill="#94A3B8" stroke="#475569" strokeWidth="0.8" />
          <line x1="11" y1="16" x2="25" y2="16" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="21" x2="25" y2="21" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="26" x2="19" y2="26" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 36 36" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="14" fill="#16834A" />
          <circle cx="18" cy="18" r="6" fill="#FFFFFF" />
        </svg>
      );
  }
}
