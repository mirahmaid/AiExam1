/**
 * هل مهام الخلفية مفعّلة؟
 *
 * BullMQ بده Redis حقيقي (الـ MockRedis تبع RedisService بتخدم الكاش
 * وحدود المعدل بس). بدون REDIS_URL كنا نسجّل الطوابير والـ workers على
 * أي حال، فكانوا يحاولوا الاتصال ويطبعوا عشرات أسطر ECONNREFUSED عند كل
 * إقلاع — يعني تشغيل سليم بيبيّن كإنه مكسور.
 *
 * منقرأ process.env مباشرة لأن القرار لازم يتاخد وقت تعريف الموديول،
 * قبل ما ConfigService يكون جاهز.
 */
export const QUEUES_ENABLED = Boolean(process.env.REDIS_URL);

/** رسالة موحّدة لما يطلب أحد مهمة خلفية وما في Redis. */
export const QUEUES_DISABLED_MESSAGE =
  'Background processing is unavailable: set REDIS_URL to enable it.';
