import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaYoutube, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">🌿 جمعيتي</div>
            <p>منصة جمعيتي الخيرية — نربط المحسنين بالمحتاجين من خلال نظام شفاف وموثوق لإدارة التبرعات والحالات الإنسانية.</p>
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
              <li><Link to="/cases">الحالات</Link></li>
              <li><Link to="/campaigns">الحملات</Link></li>
              <li><Link to="/jobs">الوظائف</Link></li>
              <li><Link to="/contact">تواصل معنا</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>خدماتنا</h4>
            <ul>
              <li><a href="#">التبرع الإلكتروني</a></li>
              <li><a href="#">كفالة يتيم</a></li>
              <li><a href="#">زكاة المال</a></li>
              <li><a href="#">التطوع</a></li>
              <li><a href="#">الحملات الخيرية</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>تواصل معنا</h4>
            <ul>
              <li><a href="mailto:info@jam3iyati.eg">info@jam3iyati.eg</a></li>
              <li><a href="tel:+201000000000">01000000000+</a></li>
              <li><a href="#">واتساب: 01000000000</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} جمعيتي الخيرية — جميع الحقوق محفوظة | تم التطوير بواسطة <strong>شركة أرقام</strong></p>
        </div>
      </div>
    </footer>
  );
}
