import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/presentation/utils/cn'
import { Button } from '@/presentation/components/ui/button'

interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select')
  }
  return context
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, ...props }, ref) => {
    const { open, setOpen, value } = useSelectContext()
    const displayValue = React.useContext(SelectValueContext)

    return (
      <Button
        ref={ref}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn('justify-between', className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        <span className="truncate">{displayValue || value || 'Select...'}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  },
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps {
  placeholder?: string
}

const SelectValueContext = React.createContext<string>('')

const SelectValue = ({ placeholder = 'Select...' }: SelectValueProps) => {
  const { value } = useSelectContext()
  return <SelectValueContext.Provider value={placeholder}>{value || placeholder}</SelectValueContext.Provider>
}
SelectValue.displayName = 'SelectValue'

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext()

    if (!open) return null

    return (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div
          ref={ref}
          className={cn(
            'absolute top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover shadow-md',
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
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: contextValue, onValueChange, setOpen } = useSelectContext()
    const isSelected = contextValue === value

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center gap-2 px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          isSelected && 'bg-accent text-accent-foreground',
          className,
        )}
        onClick={() => {
          onValueChange(value)
          setOpen(false)
        }}
        {...props}
      >
        <Check className={cn('h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
        <span>{children}</span>
      </div>
    )
  },
)
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
