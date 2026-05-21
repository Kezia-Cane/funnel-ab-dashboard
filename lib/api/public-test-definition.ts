import type { ABTest, ABVariant } from '@/types'

export type PublicABVariantDefinition = {
    variant_key: string
    headline: string
    subheadline?: string
    is_control: boolean
}

export type PublicABTestDefinition = {
    test_key: string
    status: ABTest['status']
    variants: PublicABVariantDefinition[]
}

export function buildPublicTestDefinition(
    test: ABTest | null,
    variants: ABVariant[],
): PublicABTestDefinition | null {
    if (!test || test.status !== 'active' || !variants.length) {
        return null
    }

    return {
        test_key: test.test_key,
        status: test.status,
        variants: variants.map((variant) => ({
            variant_key: variant.variant_key,
            headline: variant.headline,
            ...(variant.subheadline ? { subheadline: variant.subheadline } : {}),
            is_control: variant.is_control,
        })),
    }
}
