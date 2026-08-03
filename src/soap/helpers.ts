import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { api } from '../config/axios';

interface RequestProps {
	xml: unknown;
	url: string;
	SOAPAction: string;
}

const options = {
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	format: true,
};

const parser = new XMLParser(options);
const builder = new XMLBuilder(options);

const request = async ({ xml, url, SOAPAction }: RequestProps) => {
	const response = await api.post(url, xml, {
		headers: {
			'Content-Type': 'text/xml; charset=utf-8',
			SOAPAction: `http://tempuri.org/${SOAPAction}`,
		},
	});

	return response.data;
};

const SOAP_NAMESPACES = {
	'@_xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance',
	'@_xmlns:d': 'http://www.w3.org/2001/XMLSchema',
	'@_xmlns:c': 'http://schemas.xmlsoap.org/soap/encoding/',
	'@_xmlns:v': 'http://schemas.xmlsoap.org/soap/envelope/',
};

export const Helpers = {
	request,
	SOAP_NAMESPACES,
	XML: {
		parse: (data: string) => parser.parse(data),
		build: (obj: unknown) => builder.build(obj),
	},
};
