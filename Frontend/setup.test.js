import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
document.body.innerHTML = '<div id="root"></div>';

fetchMock.enableMocks();