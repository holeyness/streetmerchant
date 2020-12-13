import {Browser, Page, Response} from 'puppeteer';
import {StatusCodeRangeArray, Store} from './store/model';
import {config} from './config';
import {disableBlockerInPage} from './adblocker';
import {getRandom} from 'random-useragent';
import {logger} from './logger';

export function getSleepTime(store: Store) {
	const minSleep = store.minPageSleep as number;
	return (
		minSleep + Math.random() * ((store.maxPageSleep as number) - minSleep)
	);
}

export async function delay(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function isStatusCodeInRange(
	statusCode: number,
	range: StatusCodeRangeArray
) {
	for (const value of range) {
		let min: number;
		let max: number;
		if (typeof value === 'number') {
			min = value;
			max = value;
		} else {
			[min, max] = value;
		}

		if (min <= statusCode && statusCode <= max) {
			return true;
		}
	}

	return false;
}

export async function usingResponse<T>(
	browser: Browser,
	url: string,
	cb: (response: Response | null, page: Page, browser: Browser) => Promise<T>
): Promise<T> {
	return usingPage(browser, async (page, browser) => {
		const response = await page.goto(url, {waitUntil: 'domcontentloaded'});

		return cb(response, page, browser);
	});
}

export async function usingPage<T>(
	browser: Browser,
	cb: (page: Page, browser: Browser) => Promise<T>
): Promise<T> {
	const page = await browser.newPage();
	page.setDefaultNavigationTimeout(config.page.timeout);
	await page.setUserAgent(await getRandomUserAgent());

	try {
		return await cb(page, browser);
	} finally {
		try {
			await closePage(page);
		} catch (error: unknown) {
			logger.error(error);
		}
	}
}

export async function closePage(page: Page) {
	if (!config.browser.lowBandwidth) {
		await disableBlockerInPage(page);
	}

	await page.close();
}

export async function getRandomUserAgent(): Promise<string> {
	const uaList = [
		"Mozilla/5.0 (Linux; arm; Android 9; SM-J730FM) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 YaApp_Android/11.02 YaSearchBrowser/11.02 BroPP/1.0 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 5.1.1; SM-J320F Build/LMY47V; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 5.0.1; Lenovo TAB 2 A10-70L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 YaBrowser/19.9.3.116.01 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; SM-A307FN Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; U; Android 9; en-us; CPH1821 Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.80 Mobile Safari/537.36 HeyTapBrowser/15.7.2.5",
		"Mozilla/5.0 (Linux; Android 8.0.0; PRA-LA1 Build/HUAWEIPRA-LA1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; Android 6.0; BGO-DL09) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; SM-J701F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Whale/2.7.99.22 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 6.0.1; SM-J106H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 10; ONEPLUS A6003 Build/QKQ1.190716.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; U; Android 7.1; xx-xx; CPH1801 Build/NMF26F) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.134 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 10; SM-A605FN Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 6.0; PRO 6 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.146 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91",
		"Mozilla/5.0 (Linux; Android 4.4.3; HTC One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; Redmi 6A Build/O11019; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.83 Mobile Safari/537.36 YandexSearch/7.45 YandexSearchBrowser/7.45",
		"Mozilla/5.0 (Linux; Android 9; SM-T295 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 4.4.4; 2014811) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.111 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 6.0.1; SM-G389F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36",
		"Opera/9.80 (Android; Opera Mini/8.0.1807/176.145; U; ru) Presto/2.12.423 Version/12.16",
		"Mozilla/5.0 (Linux; Android 9; ZTE 2050RU Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.82 Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 9; Mi A1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.5.63.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm; Android 6.0; Plane 8702T 4G PS8128PL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.6.0.181.01 (beta) Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; Redmi Note 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.53 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 6.0; Lenovo TB3-X70L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.5.63.01 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; SM-N950F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 Line/10.10.1/IAB",
		"Mozilla/5.0 (Linux; Android 10; SM-A600FN Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (Linux; Android 9; FIG-LX1 Build/HUAWEIFIG-L31; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/79.0.3945.116 Mobile Safari/537.36 Instagram 123.0.0.21.114 Android (28/9; 480dpi; 1080x2032; HUAWEI; FIG-LX1; HWFIG-H; hi6250lv_LV; 188791674)",
		"Mozilla/5.0 (Linux; Android 10; COL-L29 Build/HUAWEICOL-L29; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 YaBrowser/20.4.4.168.10 Mobile/15E148 Safari/604.1",
		"Mozilla/5.0 (Linux; Android 7.0; HIT Q401 3G HT4039PG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 6.0; U10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.96 YaBrowser/20.4.1.144.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; CITI 7507 4G CS7113PL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 9; ZB631KL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.6.0.182.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 5.0.2; HTC One M9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.93 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 7.0; HIT Q500 3G HT5035PG Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.162 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 5.1.1; ASUS_X013DB) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 10; Redmi Note 9S) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.5.63.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; BQ-5512L Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91",
		"Mozilla/5.0 (Linux; Android 10; SM-A207F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/9.20 YaSearchBrowser/9.20",
		"Mozilla/5.0 (Linux; Android 10; M2003J15SC Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Windows NT 6.1; Trident/7.0; TCO_20200626095221; rv:11.0) like Gecko",
		"Mozilla/5.0 (Linux; Android 9; ANE-LX1 Build/HUAWEIANE-L21; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; VIA_A3 Build/OPM1.171019.019) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 10; SM-G981U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.116 Mobile Safari/537.36 EdgA/45.05.4.5036",
		"Mozilla/5.0 (Linux; arm_64; Android 9; ZB602KL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.5.63.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 6.0; BQS-5520 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.119 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; Android 5.1.1; GEM-703L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 OPR/58.2.2878.53403",
		"Mozilla/5.0 (Linux; Android 9; G8342 Build/47.2.A.4.45; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36 YandexSearch/7.21",
		"Mozilla/5.0 (Linux; Android 7.0; SM-A710F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 YaBrowser/17.3.2.414.00 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 6.0; HTC One M9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 OPR/58.1.2878.53366",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 YaBrowser/20.4.4.227.10 Mobile/15E148 Safari/604.1",
		"Mozilla/5.0 (Windows NT 6.1; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 OPR/68.0.3618.186 (Edition Yx GX)",
		"Mozilla/5.0 (Linux; Android 7.0; 5058) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
		"Mozilla/5.0 (Windows NT 10.0; rv:41.0) Gecko/20100101 Firefox/41.0 SeaMonkey/2.38",
		"Mozilla/5.0 (X11; U; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.97 Safari/537.36",
		"Mozilla/5.0 (Linux; U; Android 6.0; ru-RU; Y6 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.10.0.1163 UCTurbo/1.8.6.900 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.0.0; SM-A520F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; arm_64; Android 9; Redmi 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.6.0.182.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 6.0; U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.90 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 10; vivo 1909) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.96 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-A750FN) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.0 Chrome/79.0.3945.136 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; SM-J400M Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (Linux; Android 8.1.0; Impress_Stone Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; arm; Android 5.1; U63YR) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 YaBrowser/20.2.4.153.01 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; MRD-LX1F Build/HUAWEIMRD-LX1F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/263.0.0.46.121;]",
		"Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-T813) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.0 Chrome/79.0.3945.136 Safari/537.36",
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 (Chromium GOST) Safari/537.36",
		"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 OPR/43.0.2442.991 (Edition Campaign 18)",
		"Mozilla/5.0 (Linux; Android 8.0.0; 2PS64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 5.0.2; Lenovo A6000 Build/LRX22G; ru-ru) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36 Puffin/7.8.3.40913AP",
		"Mozilla/5.0 (Linux; Android 10; Redmi Note 9S Build/QKQ1.191215.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; Android 8.0.0; ATU-L21 Build/HUAWEIATU-L21; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (Linux; Android 5.1.1; Ursus NS310 Build/LMY48G) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; PMT5588_4G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.93 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 10.0; MI 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.96 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; ASUS_X018D Build/O11019) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; Android 9; SM-M107F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; LM-X510WM) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; U; Android 8.1.0; en-US; Redmi Note 5 Build/OPM1.171019.019) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/13.2.0.1296 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; ZTE Blade A5 2019RU Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 YaApp_Android/11.01 YaSearchBrowser/11.01",
		"Mozilla/5.0 (Linux; Android 10; Nokia 2.2 Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (Linux; Android 9; STF-L09 Build/HUAWEISTF-L09) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.136 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91",
		"Mozilla/5.0 (Linux; Android 9; Flare S8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 9; COL-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.6.0.182.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 7.0; G3212) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; Mi A2 Lite Build/PKQ1.180917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/275.0.0.49.127;]",
		"Mozilla/5.0 (Linux; Android 6.0.1; Federer) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.1.0; MI 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; Redmi 7 Build/PKQ1.181021.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.99 Mobile Safari/537.36 YaApp_Android/10.70 YaSearchBrowser/10.70",
		"Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 147.0.0.30.121 (iPhone11,8; iOS 13_5_1; en_RU; en-GB; scale=2.00; 828x1792; 224680684)",
		"Mozilla/5.0 (Linux; Android 10; POT-LX1 Build/HUAWEIPOT-L21; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (Linux; Android 10; SM-N975F Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/276.0.0.44.127;]",
		"Mozilla/5.0 (Linux; Android 9; ANE-LX1 Build/HUAWEIANE-L21) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.136 Mobile Safari/537.36 YaApp_Android/9.00 YaSearchBrowser/9.00",
		"Mozilla/5.0 (Linux; Android 4.3; LT25i Build/9.2.A.2.5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 8.0.0; SAMSUNG SM-N950F/N950FXXS5CRK4) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/11.2 Chrome/75.0.3770.143 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; Android 9; SM-G973F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/275.0.0.49.127;]",
		"Mozilla/5.0 (Linux; arm_64; Android 8.0.0; CUBOT_P20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.5.63.00 SA/1 Mobile Safari/537.36",
		"Mozilla/5.0 (Linux; arm_64; Android 9; STF-L09) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.6.0.182.00 SA/1 Mobile Safari/537.36",
	];

	return uaList[Math.floor(Math.random() * uaList.length)];;
}
