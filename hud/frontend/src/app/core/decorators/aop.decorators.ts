/**
 * AOP (Aspect-Oriented Programming) Decorator for Angular 22
 * 
 * Intercepts method execution to measure and log performance.
 * Ideal for profiling heavy render calculations or UI interactions.
 */
export function MeasureRender(): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const end = performance.now();
      
      const duration = (end - start).toFixed(2);
      
      // Only log if it took more than 1ms to avoid spam, 
      // or we can log all for demonstration purposes.
      console.debug(`[AOP @MeasureRender] ${String(propertyKey)} took ${duration} ms.`);
      
      return result;
    };

    return descriptor;
  };
}
