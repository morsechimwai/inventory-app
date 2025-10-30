export default function InventoryActivityPage() {
  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-muted-foreground font-sans">
          Track stock movements and see what’s been added, removed, or updated in real time.
        </p>
        {/* {units.length > 0 && (
          <Button className="font-sans font-bold text-sm" onClick={handleOpenCreate} disabled={saving}>
            <ListPlus className="mr-1 size-4" />
            <span>Add Unit</span>
          </Button>
        )} */}
      </div>
    </section>
  )
}
