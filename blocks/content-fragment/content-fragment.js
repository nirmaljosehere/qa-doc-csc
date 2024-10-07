function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...document.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content)
    .join(', ');
  return meta || '';
}

//const aem = "http://localhost:4503";
//const aem = "https://publish-p107058-e1001010.adobeaemcloud.com";
const aem = "https://publish-p135360-e1341441.adobeaemcloud.com/";

export default function decorate(block) {

  const slugID = document.createElement('div');
  slugID.id = 'slug';
  slugID.textContent = block.querySelector('div:nth-child(1)').textContent.trim();
  block.querySelector('div:nth-child(1)').replaceWith(slugID);

  const destinationDiv = document.createElement('div');
  destinationDiv.id = `destination-${slugID.textContent}`;
  block.querySelector('div:last-of-type').replaceWith(destinationDiv);

  fetch(`${aem}/graphql/execute.json/qatar-airways/destination-by-slug;slug=${slugID.textContent}`)
    .then(response => response.json())
    .then(response => {
      const { primaryImage, cityName, cityNickName, cityDescription } = response.data.travelDestinationList.items[0];
      const imageURL = `${aem}${primaryImage._dynamicUrl}`;

      destinationDiv.innerHTML = `
        <div class='destination-image'>
          <img src="${imageURL}" alt="${cityName}">
        </div>
        <div class='destination-content'>
          <div class='destination-content-title'><h3>${cityName}</h3></div>
          <div class='destination-content-subtitle'><h4>${cityNickName}</h4></div>
          <div class='destination-content-description'><p>${cityDescription.plaintext}</p></div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

}





