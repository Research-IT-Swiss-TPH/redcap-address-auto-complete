# Address Auto Complete
**Please note that currently supported countries are: Switzerland.**

Redcap Module that helps you to easily create Auto-Complete Address fields that fetch results from APIs. Additionally, save geo data in custom variables and adjust the format of the address label.

![Demo](address_auto_complete_demo.gif)

## Setup

Install the module from REDCap module repository and enable over Control Center.

## Configuration

- API Source: Select the source from where the auto-complete list will be generated.
- API Response Limit: Defines how may results are returned per search request. This can significantly affect performance. Default and maximum are set to 20.
- API Key: An API key can be used to have higher priviliges, such as performing more requests per time. In general API keys are obtained by application.
- Enable for Data Entry or Enable for Survey: Define where the module will be rendered.
- Target Field: Select target field to be transformed into Address Auto-Complete
- Target Meta: Select meta field where geo information should be saved. Format is <code>address-id, x, y</code>.
- Custom output format: Use <i>%PLACEHOLDER%</i> to refer to address parts. <i>Default: <code>%STREET% %NO%, %CODE% %PLACE%</code></i>
- Enable Javascript Debug: Shows Log Messages in Javascript Console.

## Add your API source

*Requirements for APIs*

- Trustable: Open Source or Official APIs by Governments
- Free: Non-Commercial
- Compatible: The search endpoint should be accessbile through a GET-request and should return a JSON response.

If you want to add your own API, please make a Pull Request that includes the following edits:

- `/sources/sources.json`: Add the API details, such as identifier, url, endpoint, search term, etc.
- `/sources/your_api_source.php`: Add a mapping function, that maps your API response to the Address class of the module.
- `/config.json`: Add your api source as a name-value-pair under choices for the project setting `api-source`.
- `/sources/img/your.api.svg`: Optionally, add a logo of the API in svg format. 


If you cannot make the development yourself, but have found a useful API, please [open a Github Issue](https://github.com/tertek/redcap-address-auto-complete/issues) describing the details about the API source to be added.

## Available APIs

Identifier    | Country
------------- | --------------------
geo.admin.ch  | Switzerland


## Roadmap

- Improve Source Validation before Module render.
- Add manual address insertion feature.

## Changelog

Version | Description
------- | --------------------
v1.0.0  | Initial release.
