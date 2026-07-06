"""UniSMS 短信发送服务"""
import logging
from ..core.config import get_settings

logger = logging.getLogger(__name__)


async def send_verification_code(phone: str, code: str) -> bool:
    """通过 UniSMS 发送验证码短信。

    返回 True 表示发送成功，False 表示失败。
    如果未配置 API Key，记录日志并返回 False。
    """
    settings = get_settings()

    if not settings.sms_access_key_id:
        logger.warning("SMS API Key 未配置，验证码 %s 未发送到 %s", code, phone)
        return False

    try:
        from unisdk.sms import UniSMS
        from unisdk.exception import UniException

        client = UniSMS(
            settings.sms_access_key_id,
            settings.sms_access_key_secret or None,
        )

        res = client.send(
            {
                "to": phone,
                "signature": settings.sms_signature,
                "templateId": settings.sms_template_id,
                "templateData": {"code": code},
            }
        )

        logger.info(
            "短信发送成功: phone=%s, res_code=%s",
            phone,
            res.data.get("code"),
        )
        return res.data.get("code") == "OK"

    except UniException as e:
        logger.error("UniSMS 发送失败: %s", e)
        return False
    except Exception as e:
        logger.error("短信发送异常: %s", e)
        return False
