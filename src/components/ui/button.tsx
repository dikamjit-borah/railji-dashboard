import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rail-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-rail-800 text-white rounded-lg shadow-sm hover:bg-rail-700 active:bg-rail-900',
        secondary:
          'bg-warm-100 text-rail-800 border border-warm-200 rounded-lg hover:bg-warm-200 active:bg-warm-300',
        ghost:
          'text-rail-600 rounded-lg hover:bg-warm-100 hover:text-rail-800 active:bg-warm-200',
        outline:
          'border border-warm-200 bg-white text-rail-700 rounded-lg hover:bg-warm-50 hover:border-warm-300 active:bg-warm-100',
        destructive:
          'bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 active:bg-red-700',
        amber:
          'bg-amber-500 text-white rounded-lg shadow-sm hover:bg-amber-600 active:bg-amber-700',
        link:
          'text-rail-600 underline-offset-4 hover:underline hover:text-rail-800',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
        xl: 'h-11 px-8 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
