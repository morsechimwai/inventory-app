import { cn } from "@/lib/utils"
import { useState } from "react"

// UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"

// Icons
import { ChevronsUpDown, Check } from "lucide-react"

interface SelectComboboxProps {
  id: string
  value?: string
  onChange: (value: string | undefined) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  options: { label: string; value: string }[]
  ariaInvalid?: boolean
  allowClear?: boolean
  emptyLabel?: string
}

export type ComboboxOption = {
  label: string
  value: string
}

const CLEAR_VALUE = "__clear__"

export default function SelectCombobox({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  options,
  ariaInvalid,
  allowClear = false,
  emptyLabel,
}: SelectComboboxProps) {
  // State
  const [open, setOpen] = useState(false)

  const selectedOption = value ? options.find((option) => option.value === value) ?? null : null
  const displayText = selectedOption?.label ?? (value ? value : emptyLabel ?? placeholder)
  const showPlaceholder = !selectedOption && !value && !emptyLabel

  const handleSelect = (nextValue: string) => {
    if (allowClear && nextValue === CLEAR_VALUE) {
      onChange(undefined)
    } else {
      onChange(nextValue)
    }
    setOpen(false)
    onBlur?.()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-command`}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "w-full justify-between overflow-hidden text-left font-normal",
            "group-data-[invalid=true]/field:border-destructive group-data-[invalid=true]/field:text-destructive",
            showPlaceholder ? "text-muted-foreground" : ""
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)", minWidth: "260px" }}
      >
        <Command id={`${id}-command`}>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Options">
              {allowClear ? (
                <CommandItem value={CLEAR_VALUE} onSelect={handleSelect}>
                  <Check className={cn("mr-2 h-4 w-4", value ? "opacity-0" : "opacity-100")} />
                  {emptyLabel ?? "None"}
                </CommandItem>
              ) : null}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
