export function getCorsOptions(urls: string[]) {
    var splittedUrl: string[];
    var hostname: string;
    var normalUrl: string;
    var capacitorUrl: string;
    var currentUrl: string;
    var finalOrigins: string[] = [];
    for (var i = 0; i < urls.length; i++) {
        currentUrl = urls[i];
        splittedUrl = currentUrl.split('://');
        hostname = splittedUrl[1];
        normalUrl = currentUrl;
        capacitorUrl = 'capacitor://' + hostname;
        finalOrigins.push(normalUrl);
        finalOrigins.push(capacitorUrl);
    }
    return {
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        origin: finalOrigins,
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    };
}