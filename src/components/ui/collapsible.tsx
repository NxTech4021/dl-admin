"use client"

// OPTIMIZATION: Named imports instead of wildcard
import {
  Root as CollapsibleRoot,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
  CollapsibleContent as CollapsibleContentPrimitive,
} from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsibleRoot>) {
  return <CollapsibleRoot data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPrimitive>) {
  return (
    <CollapsibleTriggerPrimitive
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsibleContentPrimitive>) {
  return (
    <CollapsibleContentPrimitive
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
