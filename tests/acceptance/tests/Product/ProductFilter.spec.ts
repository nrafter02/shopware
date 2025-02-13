import { test } from '@fixtures/AcceptanceTest';
import { Manufacturer, Product, PropertyGroup } from '@shopware-ag/acceptance-test-suite';

test('Customer should see unavailable filter disabled based on selected filter', async ({
    ShopCustomer,
    TestDataService,
    StorefrontHome,
}) => {
    await TestDataService.setSystemConfig({ 'core.listing.disableEmptyFilterOptions': true });
    const color = await TestDataService.createColorPropertyGroup();
    const size = await TestDataService.createTextPropertyGroup();
    const propertyGroupsColor: PropertyGroup[] = [];
    const propertyGroupsText: PropertyGroup[] = [];
    propertyGroupsColor.push(color);
    propertyGroupsText.push(size);
    const sizeOptions = await TestDataService.getPropertyGroupOptions(size.id);
    let colorManufacturer: Manufacturer;
    let parentProductColor: Product;
    let variantProductColor: Product[];
    let sizeManufacturer: Manufacturer;
    let parentProductSize: Product;
    let variantProductSize: Product[];

    await test.step('Create manufacturer and products', async () => {
        const freeShipManufacturer = await TestDataService.createBasicManufacturer({
            name: 'Free-shipping Manufacturer',
            description: 'Free ship Description Manufacturer',
        });
        await TestDataService.createBasicProduct({ shippingFree: true, manufacturerId: freeShipManufacturer.id });
        colorManufacturer = await TestDataService.createBasicManufacturer({
            name: 'Color Manufacturer',
            description: 'Color Description Manufacturer',
        });
        parentProductColor = await TestDataService.createBasicProduct({ manufacturerId: colorManufacturer.id });
        variantProductColor = await TestDataService.createVariantProducts(parentProductColor, propertyGroupsColor, {
            description: 'Variant description',
        });
        sizeManufacturer = await TestDataService.createBasicManufacturer({
            name: 'Size Manufacturer',
            description: 'Size Description Manufacturer',
        });
        parentProductSize = await TestDataService.createBasicProduct({ manufacturerId: sizeManufacturer.id });
        variantProductSize = await TestDataService.createVariantProducts(parentProductSize, propertyGroupsText, {
            description: 'Variant description',
        });
    });

    await test.step('Select a manufacturer and verify that unavailable filter is disabled and products are filtered', async () => {
        await ShopCustomer.goesTo(StorefrontHome.url());
        await StorefrontHome.manufacturerFilter.click();
        const manufacturerLocators = await StorefrontHome.getFilterItemByFilterName(colorManufacturer.name);
        await manufacturerLocators.click();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(size.name)).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.freeShippingFilter).toBeDisabled();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(color.name)).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.priceFilterButton).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveCount(1);
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveText(
            new RegExp(variantProductColor.map((product) => product.name).join('|'))
        );
    });

    await test.step('Reset all filters and verify that all filters are enabled', async () => {
        await StorefrontHome.manufacturerFilter.click();
        await StorefrontHome.resetAllButton.click();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(size.name)).toBeEnabled();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(color.name)).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.manufacturerFilter).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.freeShippingFilter).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.priceFilterButton).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveCount(3);
    });

    await test.step('Select another manufacturer and verify that a different filter is disabled', async () => {
        await StorefrontHome.manufacturerFilter.click();
        const manufacturerLocators = await StorefrontHome.getFilterItemByFilterName(sizeManufacturer.name);
        await manufacturerLocators.click();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(color.name)).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.freeShippingFilter).toBeDisabled();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(size.name)).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.priceFilterButton).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveCount(1);
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveText(
            new RegExp(variantProductSize.map((product) => product.name).join('|'))
        );
    });

    await test.step('Filter only by size and verify color and manufacturer filters are disabled', async () => {
        await StorefrontHome.manufacturerFilter.click();
        await StorefrontHome.resetAllButton.click();
        const sizeFilter = await StorefrontHome.getFilterButtonByFilterName(size.name);
        const colorFilter = await StorefrontHome.getFilterButtonByFilterName(color.name);
        await ShopCustomer.expects(sizeFilter).toBeEnabled();
        await ShopCustomer.expects(colorFilter).toBeEnabled();
        await sizeFilter.click();
        const sizeOption = await StorefrontHome.getFilterItemByFilterName(sizeOptions[0].name);
        await sizeOption.click();

        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(color.name)).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.freeShippingFilter).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.priceFilterButton).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.manufacturerFilter).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveCount(1);
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveText(
            new RegExp(variantProductSize.map((product) => product.name).join('|'))
        );
        await StorefrontHome.resetAllButton.click();
    });

    await test.step('Select filter by free shipping, verify that all filters are disabled', async () => {
        await StorefrontHome.freeShippingFilter.click();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(size.name)).toBeDisabled();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(color.name)).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.priceFilterButton).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.manufacturerFilter).toBeEnabled();
    });
});

test('Should filter by rating and disable not possible rating filter options', async ({
    ShopCustomer,
    TestDataService,
    StorefrontHome,
}) => {
    await TestDataService.setSystemConfig({ 'core.listing.disableEmptyFilterOptions': true });
    const color = await TestDataService.createColorPropertyGroup();
    const propertyGroupsColor: PropertyGroup[] = [];
    propertyGroupsColor.push(color);
    const colorManufacturer = await TestDataService.createBasicManufacturer({
        name: 'Color Manufacturer',
        description: 'Color Description Manufacturer',
    });
    const parentProductColor = await TestDataService.createBasicProduct({ manufacturerId: colorManufacturer.id });
    await TestDataService.createVariantProducts(parentProductColor, propertyGroupsColor, {
        description: 'Variant description',
    });
    const freeShipManufacturer = await TestDataService.createBasicManufacturer({
        name: 'Free-shipping Manufacturer',
        description: 'Free ship Description Manufacturer',
    });
    await TestDataService.createBasicProduct({ shippingFree: true, manufacturerId: freeShipManufacturer.id });
    const productWithRating1 = await TestDataService.createBasicProduct();
    const productWithRating2 = await TestDataService.createBasicProduct();
    await TestDataService.createProductReview(productWithRating1.id, { points: 5 });
    await TestDataService.createProductReview(productWithRating2.id, { points: 5 });
    const products = [productWithRating1, productWithRating2];

    await test.step('Select a rating and verify that unavailable filter is disabled and products are filtered', async () => {
        await ShopCustomer.goesTo(StorefrontHome.url());
        await StorefrontHome.productRatingButton.click();
        const ratingLocator = await StorefrontHome.getRatingItemLocatorByRating(5);
        await ratingLocator.click();
        await ShopCustomer.expects(await StorefrontHome.getFilterButtonByFilterName(color.name)).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.freeShippingFilter).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.priceFilterButton).toBeEnabled();
        await ShopCustomer.expects(StorefrontHome.manufacturerFilter).toBeDisabled();
        await ShopCustomer.expects(StorefrontHome.productItemNames).toHaveCount(2);
        await ShopCustomer.expects(StorefrontHome.productItemNames.nth(0)).toHaveText(
            new RegExp(products.map((product) => product.name).join('|'))
        );
        await ShopCustomer.expects(StorefrontHome.productItemNames.nth(1)).toHaveText(
            new RegExp(products.map((product) => product.name).join('|'))
        );
    });
});

test('Customer should be able to create a new property display it on the product detail page', async ({
    ShopCustomer,
    TestDataService,
    StorefrontHome,
    StorefrontProductDetail,
}) => {
    await TestDataService.setSystemConfig({ 'core.listing.disableEmptyFilterOptions': true });
    const color = await TestDataService.createColorPropertyGroup();
    const propertyGroupsColor: PropertyGroup[] = [];
    propertyGroupsColor.push(color);
    const colorManufacturer = await TestDataService.createBasicManufacturer({
        name: 'Color Manufacturer',
        description: 'Color Description Manufacturer',
    });
    const parentProductColor = await TestDataService.createBasicProduct({ manufacturerId: colorManufacturer.id });
    const variantProductColor = await TestDataService.createVariantProducts(parentProductColor, propertyGroupsColor, {
        description: 'Variant description',
    });

    await test.step('Verify property display on the product detail page', async () => {
        await ShopCustomer.goesTo(StorefrontHome.url());
        await StorefrontHome.productItemNames.nth(0).click();
        await ShopCustomer.expects(StorefrontProductDetail.addToCartButton).toBeVisible();
        await ShopCustomer.expects(StorefrontProductDetail.productDetailConfiguratorGroupTitle).toHaveText(
            `Select ${color.name}`
        );
        await ShopCustomer.expects(StorefrontProductDetail.productDetailConfiguratorOptionInputs).toHaveCount(
            variantProductColor.length
        );
    });
});
