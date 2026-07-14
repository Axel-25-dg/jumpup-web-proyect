import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'
import { Button } from '@/presentation/components/ui/button'

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  side: 'left' | 'right' | 'top' | 'bottom'
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

const useSheetContext = () => {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet')
  }
  return context
}

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Sheet = ({ open: controlledOpen, onOpenChange, children }: SheetProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(value)
    }
    onOpenChange?.(value)
  }

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen, side: 'left' }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild = false, children, ...props }, ref) => {
    const { setOpen } = useSheetContext()

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ onClick?: () => void }>
      return React.cloneElement(child, {
        ...props,
        onClick: () => setOpen(true),
      } as any)
    }

    return (
      <button
        ref={ref}
        onClick={() => setOpen(true)}
        {...props}
      >
        {children}
      </button>
    )
  },
)
SheetTrigger.displayName = 'SheetTrigger'

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = 'left', children, ...props }, ref) => {
    const { open, setOpen } = useSheetContext()

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          setOpen(false)
        }
      }

      if (open) {
        document.addEventListener('keydown', handleEscape)
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }, [open, setOpen])

    if (!open) return null

    const sideClass = {
      left: 'left-0 h-screen w-full max-w-sm',
      right: 'right-0 h-screen w-full max-w-sm',
      top: 'top-0 w-full',
      bottom: 'bottom-0 w-full',
    }[side]

    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
        <div
          ref={ref}
          className={cn(
            'fixed z-50 bg-background shadow-lg transition-all duration-300',
            sideClass,
            open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  },
)
SheetContent.displayName = 'SheetContent'

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between p-4', className)} {...props} />
  ),
)
SheetHeader.displayName = 'SheetHeader'

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  ),
)
SheetTitle.displayName = 'SheetTitle'

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ ...props }, ref) => {
    const { setOpen } = useSheetContext()

    return (
      <Button ref={ref} variant="ghost" size="icon" onClick={() => setOpen(false)} {...props}>
        <X className="h-4 w-4" />
      </Button>
    )
  },
)
SheetClose.displayName = 'SheetClose'

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose }
