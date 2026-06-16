import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaYoutube, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">🌿 جمعية بناء</div>
            <p>جمعية بناء للتنمية بالمنيا — جمعية أهلية مشهرة برقم 1627 لسنة 2005، تعمل على تحقيق التنمية الشاملة للفئات الأكثر احتياجًا من خلال برامج ومبادرات تنموية مستدامة.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              <li><Link to="/">الرئيسية</Link></li>
              <li><Link to="/activities">الأنشطة والفعاليات</Link></li>
              <li><Link to="/jobs">الوظائف</Link></li>
              <li><Link to="/contact">تواصل معنا</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>محاور عملنا</h4>
            <ul>
              <li><a href="#about">نبذة عن الجمعية</a></li>
              <li><a href="#vision">رؤيتنا ورسالتنا</a></li>
              <li><a href="#values">القيم الحاكمة</a></li>
              <li><a href="#board">مجلس الإدارة</a></li>
              <li><a href="#stats">إحصائيات وإنجازات</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>تواصل معنا</h4>
            <ul>
              <li><a href="mailto:info@benna.eg">info@benna.eg</a></li>
              <li><a href="tel:+201000000000">01000000000+</a></li>
              <li><a href="#">المنيا، جمهورية مصر العربية</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} جمعية بناء للتنمية بالمنيا — جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
