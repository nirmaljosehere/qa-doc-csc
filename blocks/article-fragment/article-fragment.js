function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...document.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content)
    .join(', ');
  return meta || '';
}

//const aem = "http://localhost:4503";
const aem = "https://publish-p135360-e1341441.adobeaemcloud.com";

export default function decorate(block) {

  const slugID = document.createElement('div');
  slugID.id = 'slug';
  slugID.textContent = block.querySelector('div:nth-child(1)').textContent.trim();
  block.querySelector('div:nth-child(1)').replaceWith(slugID);

  const cityDiv = document.createElement('div');
  cityDiv.id = `city-${slugID.textContent}`;
  block.querySelector('div:last-of-type').replaceWith(cityDiv);

  fetch(`${aem}/graphql/execute.json/qatar-airways/city-details-by-slug;slug=${slugID.textContent}`)
    .then(response => response.json())
    .then(response => {
      const { cityName, cityDescription, contentBlocks } = response.data.cityList.items[0];

      // Create city overview block
      const cityOverviewDiv = document.createElement('div');
      cityOverviewDiv.className = 'city-block';
      cityOverviewDiv.innerHTML = `
        <div class='city-content-title'><h3>${cityName}</h3></div>
        <div class='city-content-description'>${cityDescription.html}</div>
      `;
      cityDiv.appendChild(cityOverviewDiv);

      // Create content blocks
      contentBlocks.forEach((block, index) => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'city-detail-block';
        blockDiv.id = `city-detail-${index + 1}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'city-detail-content';
        contentDiv.innerHTML = `
          <div class='city-detail-content-title'><h4>${block.title}</h4></div>
          <div class='city-detail-content-description'>${block.description.html}</div>
        `;

        blockDiv.appendChild(contentDiv);

        if (block.image) {
          const imageDiv = document.createElement('div');
          imageDiv.className = 'city-detail-image';
          imageDiv.innerHTML = `<img src="${aem}${block.image._dynamicUrl}" alt="${block.title}">`;
          blockDiv.appendChild(imageDiv);
        }

        cityDiv.appendChild(blockDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

}





