import { DeviceTypes } from '@raducualexandrumircea/lunaris-interfaces';
import * as moment from 'moment';

export function checkCompleteRomanianPhoneNumber(phoneNumber: string): boolean {
    return /^(\+)(407[0-9]{1}[0-9]{7})$/.test(phoneNumber);
}

export function checkIfEmailIsValid(email: string): boolean {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
}

export function checkIfPasswordIsValid(password: string): boolean {
    if (password.length < 5 && password.length > 32) {
        return false;
    }
    return /^[~` !@#$%^&*()_+=[\]\{}|;':",.\/<>?a-zA-Z0-9-]+$/.test(password);
}

export function checkIfInviteCodeIsValid(inviteCode: string): boolean {
    if (inviteCode == '') {
        return true;
    }
    if (inviteCode.length != 6) {
        return false;
    }
    return /^[a-zA-Z0-9.]*$/.test(inviteCode);
}

export function isConfirmationCodeValid(code: string): boolean {
    if (code.length != 6) {
        return false;
    }
    if (!/^\d+$/.test(code)) {
        return false;
    }
    return true;
}

export function checkIfDateIsValid(date: CustomDate): boolean {
    if (date == undefined || date == null) {
        return false;
    }
    var dateString: string = date.year + '-' + date.month + '-' + date.day;
    if (date.day == '' || date.month == '' || date.year == '') {
        return false;
    }
    if (!(/^\d+$/.test(date.day) && /^\d+$/.test(date.month) && /^\d+$/.test(date.year))) {
        return false;
    }
    if (parseInt(date.year) < 1910) {
        return false;
    }
    dateString = date.year + '-' + Number(parseInt(date.month) + 1) + '-' + date.day;
    return moment(dateString, 'YYYY-MM-DD').isValid();
}

export function checkIfAgeIsValid(date: CustomDate, minAge: number): boolean {
    var age: number = getAge(date);
    return age >= minAge;
}

export function getAge(date: CustomDate): number {
    var dateString: string = date.year + '-' + date.month + '-' + date.day;
    if (!checkIfDateIsValid(date)) {
        return 0;
    }
    dateString = date.year + '-' + Number(parseInt(date.month) + 1) + '-' + date.day;
    var dateMoment = moment(dateString, 'YYYY-MM-DD');
    return moment().diff(dateMoment, 'years');
}

export function checkIfFullnameIsValid(fullname: string): boolean {
    if (fullname.length >= 31 || fullname.length <= 1) {
        return false;
    }
    if (!fullname.replace(/\s/g, '').length) {
        return false;
    }
    return /^[a-zA-Z ]*$/.test(fullname);
}

const allGenders: string[] = [
    'Aravani',
    'Agender',
    "Akava'ine",
    'Androgyne',
    'Androgynous',
    'Bigender',
    'Bandhu',
    'Brothaboy',
    'Brotherboy',
    'Female to Male',
    'FTM',
    "Fa'afafine",
    'Fakaleiti',
    'Gender nonconforming',
    'Gender fluid',
    'Gender questioning',
    'Gender bender',
    'Gender variant',
    'Genderqueer',
    'Hiira',
    'Intersex',
    'Katoey',
    'Khwaia sira',
    'Kua xing nan',
    'Kwaa-sing-bit',
    'Kothi',
    'Leiti',
    'Man',
    'Male to female',
    'MTF',
    'Mahu',
    'Mak nyah',
    'Mangalamukhi',
    'Meti',
    'Non-binary',
    'Neither',
    'Neutrois',
    'Other',
    'Pangender',
    'Palopa',
    'Sistergirl',
    'Sistagirl',
    'Trans',
    'Trans man',
    'Trans woman',
    'Trans person',
    'Transfeminine',
    'Transgender',
    'Transgender female',
    'Transgender male',
    'Transgender man',
    'Transgender person',
    'Transgender woman',
    'Transmasculine',
    'Two-spirit',
    'Tangata ira tane',
    'Thirunambi',
    'Trans laki-laki',
    'Transpinoy',
    'Transpinay',
    'Vakasalewalewa',
    'Woman',
    'Waria',
];

export function checkIfGenderIsValid(gender: string): boolean {
    return allGenders.includes(gender) || gender == 'Male' || gender == 'Female';
}

const showMeOptions: string[] = ['Male', 'Female', 'Everyone'];

export function checkIfShowMeIsValid(showMe: string): boolean {
    return showMeOptions.includes(showMe);
}

const cityOptions: string[] = [
    'Aiud',
    'Alba Iulia',
    'Arad',
    'Bacău',
    'Baia Mare',
    'Bistrița',
    'Blaj',
    'Brașov',
    'Brăila',
    'Bucharest',
    'Buzău',
    'Cluj-Napoca',
    'Constanța',
    'Corabia',
    'Craiova',
    'Câmpia Turzii',
    'Câmpulung Moldovenesc',
    'Dej',
    'Deva',
    'Drobeta-Turnu Severin',
    'Drăgășani',
    'Galați',
    'Giurgiu',
    'Hunedoara',
    'Iași',
    'Mediaș',
    'Miercurea Ciuc',
    'Moinești',
    'Oradea',
    'Orăștie',
    'Ovidiu',
    'Piatra Neamț',
    'Pitești',
    'Ploiești',
    'Reghin',
    'Reșița',
    'Râmnicu Sărat',
    'Satu Mare',
    'Sfântu Gheorghe',
    'Sibiu',
    'Sighetu Marmației',
    'Sighișoara',
    'Slatina',
    'Suceava',
    'Săcele',
    'Timișoara',
    'Turda',
    'Târgu Jiu',
    'Târgu Mureș',
    'Târnăveni',
    'Zalău',
];

export function checkIfCityIsValid(city: string): boolean {
    return cityOptions.includes(city);
}

export interface CustomDate {
    day: string;
    month: string;
    year: string;
}

export function checkIfDescriptionIsValid(description: string): boolean {
    if (description.length > 250) {
        return false;
    }
    return true;
}

export function checkIfImageIsValid(mimetype: string, sizeBytes: number): boolean {
    if (mimetype != 'image/jpeg') {
        return false;
    }
    var sizeInKb = sizeBytes / 1000; // in bytes
    var sizeInMb: number = sizeInKb / 1024;
    console.log(sizeInMb);
    if (sizeInMb >= 2) {
        return false;
    }
    return true;
}

export function checkIfDeviceTypeIsValid(deviceType: DeviceTypes): boolean {
    return ['ios', 'android', 'web'].includes(deviceType);
}

export function checkIfAgeRangeIsValid(ageRange: number[]): boolean {
    if (ageRange[0] < 18 || ageRange[0] > 100) {
        return false;
    }
    if (ageRange[1] < 18 || ageRange[1] > 100) {
        return false;
    }
    if (ageRange[0] > ageRange[1]) {
        return false;
    }
    return true;
}

export function checkIfBugDescriptionIsValid(bugDescription: string): boolean {
    return bugDescription.length <= 500 && bugDescription.length > 0;
}

export function checkIfFeedbackDescriptionIsValid(feedbackDescription: string): boolean {
    return feedbackDescription.length <= 500 && feedbackDescription.length > 0;
}
