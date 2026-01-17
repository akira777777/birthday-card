# Mobile Troubleshooting Guide

## Common Issues & Solutions

### Issue: App doesn't fill the screen on iPhone X+
**Symptoms**: White bars at top/bottom, content cut off by notch
**Solution**: Viewport meta tag with `viewport-fit=cover` is now added
**Verification**: Check that `<meta name="viewport" content="...viewport-fit=cover">` exists

---

### Issue: Animations are laggy on mobile
**Symptoms**: Choppy animations, low FPS, stuttering
**Solutions Applied**:
1. Reduced particle counts on mobile
2. Lower DPR (1.5 instead of 2)
3. Fewer decoration elements (3 hidden on mobile)
4. Simplified animation keyframes
5. Canvas desynchronization enabled

**Additional Debug**:
```javascript
// Check current FPS in console
let lastTime = performance.now();
let frames = 0;
requestAnimationFrame(function loop() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log('FPS:', frames);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(loop);
});
```

---

### Issue: Touch targets are too small
**Symptoms**: Hard to tap gnomes, accidental misses
**Solution**: Touch targets increased to 44x44px minimum
**Verification**: Gnomes now have 8px padding on mobile

---

### Issue: Pull-to-refresh interferes with app
**Symptoms**: Browser refresh triggered when scrolling
**Solution**: `overscroll-behavior: none` added to body
**Verification**: Try pulling down on the app - should not trigger refresh

---

### Issue: Blue tap highlight appears on iOS
**Symptoms**: Blue flash when tapping elements
**Solution**: `-webkit-tap-highlight-color: transparent` added
**Verification**: Tap gnomes - no blue flash should appear

---

### Issue: Images load slowly on mobile
**Symptoms**: Long loading times, blank images
**Solutions Applied**:
1. Image quality reduced on mobile (70-80%)
2. Lazy loading for decorations
3. Proper image sizes configuration
4. AVIF/WebP format support

**Check Network**:
```bash
# In Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Reload page
5. Check image sizes and load times
```

---

### Issue: App uses too much memory
**Symptoms**: Browser crashes, tab reloads, device slowdown
**Solutions Applied**:
1. Fewer particles in animations
2. Fewer decoration elements
3. Proper cleanup of timeouts/listeners
4. Canvas context optimization

**Check Memory Usage**:
```bash
# In Chrome DevTools
1. Open DevTools (F12)
2. Go to Memory tab
3. Take heap snapshot
4. Look for detached DOM nodes
5. Check total memory usage
```

---

### Issue: Reduced motion not working
**Symptoms**: Animations still play for users who prefer reduced motion
**Solution**: Comprehensive `prefers-reduced-motion` support added
**Verification**:
```bash
# Enable reduced motion:
# iOS: Settings > Accessibility > Motion > Reduce Motion
# Android: Settings > Accessibility > Remove animations
# Desktop: OS accessibility settings
```

---

### Issue: Landscape mode looks wrong
**Symptoms**: Layout breaks in landscape orientation
**Solution**: Orientation change listener added
**Verification**: Rotate device - layout should adjust

---

### Issue: Text is too small on mobile
**Symptoms**: Hard to read counter and instructions
**Solution**: Responsive font sizing with `clamp()`
**Verification**: Text should be readable without zooming

---

### Issue: Double-tap zoom interferes
**Symptoms**: Accidental zoom when tapping quickly
**Solution**: `touch-action: manipulation` added to interactive elements
**Verification**: Double-tap gnomes - should not zoom

---

## Performance Testing

### Quick Performance Check:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Run audit
5. Check Performance score (should be >80)

### Target Metrics:
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 5s
- **Speed Index**: < 4s
- **Total Blocking Time**: < 300ms
- **Cumulative Layout Shift**: < 0.1

---

## Device-Specific Issues

### iPhone SE (Small Screen)
- ✅ Touch targets sized appropriately
- ✅ Font sizes readable
- ✅ Card fits on screen

### iPhone 14 Pro (Notch)
- ✅ Safe area insets handled
- ✅ Content not hidden by notch
- ✅ Status bar styled correctly

### Android with Navigation Bar
- ✅ Bottom safe area respected
- ✅ Buttons not hidden by nav bar

### Older Devices (2018-2020)
- ✅ Reduced particle counts
- ✅ Simplified animations
- ✅ Lower image quality

---

## Browser-Specific Issues

### Safari iOS
**Issue**: Canvas rendering issues
**Solution**: Desynchronized canvas context
**Verification**: Animations should be smooth

### Chrome Mobile
**Issue**: Memory usage high
**Solution**: Proper cleanup and lower DPR
**Verification**: Check memory in DevTools

### Firefox Mobile
**Issue**: Touch events not working
**Solution**: Passive event listeners
**Verification**: Touch interactions should work

### Samsung Internet
**Issue**: Image loading slow
**Solution**: Lazy loading and quality optimization
**Verification**: Images should load progressively

---

## Debug Mode

### Enable Debug Logging:
Add to `birthday-scene.tsx`:
```typescript
useEffect(() => {
  console.log('Device Info:', {
    isMobile,
    viewport,
    prefersReducedMotion,
    dpr: window.devicePixelRatio,
    userAgent: navigator.userAgent
  });
}, [isMobile, viewport, prefersReducedMotion]);
```

### Monitor Performance:
```typescript
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Performance:', entry.name, entry.duration);
    }
  });
  observer.observe({ entryTypes: ['measure', 'navigation'] });
  return () => observer.disconnect();
}, []);
```

---

## Emergency Fixes

### If app is completely broken on mobile:
1. Check viewport meta tag exists
2. Verify JavaScript is enabled
3. Check for console errors
4. Test in incognito mode (clear cache)
5. Try different browser

### If animations are too slow:
1. Increase `motionScale` reduction
2. Reduce particle counts further
3. Disable decorations completely
4. Use static images instead of canvas

### If memory crashes occur:
1. Reduce image quality to 50%
2. Limit gnome count to 3
3. Disable trail stars
4. Clear particles more aggressively

---

## Testing Checklist

### Before Deployment:
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test in landscape mode
- [ ] Test with reduced motion
- [ ] Test on slow 3G
- [ ] Test on 2GB RAM device
- [ ] Check Lighthouse score
- [ ] Verify no console errors
- [ ] Test touch interactions
- [ ] Check image loading

### After Deployment:
- [ ] Monitor error logs
- [ ] Check analytics for bounce rate
- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Verify on real devices

---

## Support Resources

### Useful Tools:
- Chrome DevTools Device Mode
- Safari Web Inspector (iOS)
- BrowserStack for device testing
- WebPageTest for performance
- Lighthouse for audits

### Documentation:
- [MDN: Mobile Web Best Practices](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)
- [Web.dev: Mobile Performance](https://web.dev/mobile/)
- [Apple: Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Android: Mobile Web Best Practices](https://developer.android.com/guide/webapps/best-practices)

---

## Contact & Support

For issues not covered in this guide:
1. Check browser console for errors
2. Take screenshots of the issue
3. Note device model and OS version
4. Note browser and version
5. Describe steps to reproduce
