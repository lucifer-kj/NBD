import { getProducts } from '@/lib/shopify';
import { getProductUrl } from '@/lib/url-helper';

export async function GET() {
  const products = await getProducts({ first: 250 });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';

  let itemsXml = '';

  for (const product of products) {
    const vendor = product.vendor || 'Naaz Book Depot';
    
    for (const variant of product.variants) {
      const id = variant.sku || variant.id.replace('gid://shopify/ProductVariant/', '');
      const title = variant.title === 'Default Title' ? product.title : `${product.title} - ${variant.title}`;
      const description = product.description || title;
      const link = `${baseUrl}${getProductUrl(product)}`;
      const imageLink = variant.image?.url || product.featuredImage?.url || '';
      const price = variant.price.amount;
      const currency = variant.price.currencyCode;
      const availability = variant.availableForSale ? 'in_stock' : 'out_of_stock';
      const barcode = variant.barcode || '';
      const sku = variant.sku || '';

      itemsXml += `
    <item>
      <g:id>${id}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} ${currency}</g:price>
      <g:brand><![CDATA[${vendor}]]></g:brand>
      ${barcode ? `<g:gtin>${barcode}</g:gtin>` : ''}
      ${sku ? `<g:mpn>${sku}</g:mpn>` : ''}
      <g:item_group_id>${product.id.replace('gid://shopify/Product/', '')}</g:item_group_id>
    </item>`;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Naaz Book Depot</title>
    <link>https://www.naazbook.in</link>
    <description>Naaz Book Depot Google Merchant Center Feed</description>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    }
  });
}
