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

  const arrivalSlug = block.querySelector('div:nth-child(1)').textContent.trim();
  const departureSlug = block.querySelector('div:nth-child(2)').textContent.trim();  

  const destinationID = document.createElement('div');
  destinationID.id = 'destination'+'-'+arrivalSlug+'-'+departureSlug;
  block.querySelector('div:nth-child(1)').replaceWith(destinationID);

  const destinationDiv = document.createElement('div');
  destinationDiv.id = 'destination'+'-'+arrivalSlug;
  block.querySelector('div:last-of-type').replaceWith(destinationDiv);

  fetch(`${aem}/graphql/execute.json/qatar-airways/get-arrival-departure-details;arrivalSlug=${arrivalSlug};departureSlug=${departureSlug};`)  
    .then(response => response.json())
    .then(response => {
      const { arrivingInList, flyingFromList } = response.data;
      const arriving = arrivingInList.items[0];
      const flying = flyingFromList.items[0];
      const imageURL = `${aem}${arriving.mainImage._dynamicUrl}`;

      const createSection = (className, content) => `
        <div class='${className}'>
          ${Object.entries(content).map(([key, value]) => `
            <div class='${className}-${key}'>${value.html || value}</div>
          `).join('')}
        </div>
      `;

      destinationDiv.innerHTML = `
        ${createSection('destination-flyingfrom', Object.fromEntries(
          Object.entries({
            title: arriving.cityTitle ? `<h2>${arriving.cityTitle}</h2>` : '',
            description: arriving.description?.html,
            tourist: arriving.touristAttractions?.html,
            travel: arriving.travelConsiderations?.html,
            activities: arriving.activities?.html
          }).filter(([_, value]) => value)
        ))}
        ${createSection('destination-arriving', Object.fromEntries(
          Object.entries({
            title: flying.cityTitle ? `<h3>${flying.cityTitle}</h3>` : '',
            description: flying.description?.html,
            ...Object.fromEntries(
              Object.entries(flying.airportDetails || {})
                .filter(([key, value]) => ['arrivalAtAirport', 'facilitiesAndAmenities', 'transportationAndParking'].includes(key) && value)
            )
          }).filter(([_, value]) => value)
        ))}
        ${createSection('pricing-header', Object.fromEntries(
          Object.entries({
            title: `<h3>Trip fares to ${arrivalSlug.charAt(0).toUpperCase() + arrivalSlug.slice(1)} from ${departureSlug.charAt(0).toUpperCase() + departureSlug.slice(1)} </h3>`
          }).filter(([_, value]) => value)
        ))}
      `;

      // Check if a div with class hero-wrapper exists
      const heroWrapper = document.querySelector('.hero-wrapper');
      if (heroWrapper) {
        // Find the first img tag within a picture tag in the hero-wrapper
        const heroImg = heroWrapper.querySelector('picture img');
        if (heroImg) {
          // Replace the src of the img tag with imageURL
          heroImg.src = imageURL;
        }
      }
    })

    .catch(error => {
      console.error('Error fetching data:', error);
    });

}