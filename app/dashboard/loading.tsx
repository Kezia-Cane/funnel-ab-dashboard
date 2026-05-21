export default function DashboardLoading() {
    return (
        <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
            <div className="space-y-3">
                <div className="h-6 w-32 rounded-full bg-surface-container-high animate-pulse" />
                <div className="h-12 w-[28rem] max-w-full rounded bg-surface-container-high animate-pulse" />
                <div className="h-5 w-[34rem] max-w-full rounded bg-surface-container-high animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="card p-6 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high" />
                            <div className="h-6 w-20 rounded-lg bg-surface-container-high" />
                        </div>
                        <div className="h-4 w-28 rounded bg-surface-container-high" />
                        <div className="h-9 w-24 rounded bg-surface-container-high mt-3" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card min-h-[24rem] animate-pulse" />
                    <div className="card min-h-[18rem] animate-pulse" />
                    <div className="card min-h-[18rem] animate-pulse" />
                </div>
                <div className="space-y-6">
                    <div className="card min-h-[16rem] animate-pulse" />
                    <div className="card min-h-[20rem] animate-pulse" />
                </div>
            </div>
        </div>
    )
}
