var environments = {}

environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'stripe': { 
        'key': 'sk_test_51IZrGUGdqWtcA2Kl1DcM5glsyW2tnVyBVDRhWFG2utriJ6Apjkx2tFaTe3CMaSDHYAt3mW8CxblJe3fSIeejPP0B0003bh3OWK'
    } }


//production environment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsAlsoASecret',
    'maxChecks': 5
}

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;