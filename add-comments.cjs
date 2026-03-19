const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('frontend/src');

files.forEach(file => {
    if (file.includes('ProductDetails.jsx') || file.includes('Cart.jsx')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('COMPONENT: ') && content.includes('Component là gì:')) {
        return;
    }
    
    const compName = path.basename(file).replace(/\.jsx?$/, '');
    
    const hasProps = content.match(/function\s+\w+\s*\(\s*\{([^}]+)\}/) || content.match(/const\s+\w+\s*=\s*\(\s*\{([^}]+)\}/);
    const propsStr = hasProps ? `Nhận các props: ${hasProps[1].trim()}` : "Không nhận trực tiếp props truyền từ cha.";
    
    const hasState = content.includes('useState');
    const hasRedux = content.includes('useSelector');
    let stateStr = [];
    if (hasState) stateStr.push("Local State (quản lý nội bộ qua useState).");
    if (hasRedux) stateStr.push("Global State (lấy từ Redux qua useSelector).");
    if (!hasState && !hasRedux) stateStr.push("Không sử dụng state (Stateless component).");
    
    const hasUseEffect = content.includes('useEffect');
    const renderReason = [];
    if (hasState) renderReason.push("Khi Local State thay đổi.");
    if (hasRedux) renderReason.push("Khi Global State (Redux) cập nhật.");
    if (hasProps) renderReason.push("Khi Props từ cha truyền xuống thay đổi.");
    if (renderReason.length === 0) renderReason.push("Khi component cha re-render.");
    
    const hasEvent = content.includes('onClick=') || content.includes('onChange=') || content.includes('onSubmit=');
    const eventStr = hasEvent ? "Có tương tác sự kiện (onClick, onChange, onSubmit...)." : "Không có event controls phức tạp.";
    
    const hasMap = content.includes('.map(');
    const mapStr = hasMap ? "Sử dụng `.map()` để render danh sách elements." : "Không sử dụng list rendering.";
    
    const hasCond = content.includes('?') && content.includes(':') || content.includes('&&');
    const condStr = hasCond ? "Sử dụng toán tử 3 ngôi (? :) hoặc `&&` để ẩn/hiện element hoặc component." : "Render tĩnh, không có điều kiện.";

    const inputMatch = content.includes('<input') || content.includes('<textarea') || content.includes('<select');
    const inputStr = inputMatch ? 'Có form input elements (có thể bị controlled bởi state).' : 'Không chứa form controls.';

    const docBlock = `/**
 * ============================================================================
 * COMPONENT: ${compName}
 * ============================================================================
 * 1. Component là gì: 
 *    - Đảm nhiệm vai trò hiển thị và xử lý logic cho vùng phần tử \`${compName}\` trong ứng dụng.
 * 
 * 2. Props: 
 *    - ${propsStr}
 * 
 * 3. State:
 *    - ${stateStr.join('\n *      + ')}
 * 
 * 4. Render lại khi nào:
 *    - ${renderReason.join('\n *    - ')}
 * 
 * 5. Event handling:
 *    - ${eventStr}
 * 
 * 6. Conditional rendering:
 *    - ${condStr}
 * 
 * 7. List rendering:
 *    - ${mapStr}
 * 
 * 8. Controlled input:
 *    - ${inputStr}
 * 
 * 9. Lifting state up:
 *    - Dữ liệu được quản lý cục bộ hoặc đẩy lên Redux store toàn cục.
 * 
 * 10. Luồng hoạt động:
 *    - (1) Component Mount -> ${hasUseEffect ? 'Chạy useEffect (gọi API hoặc thiết lập timer/listener).' : 'Chỉ mount giao diện thuần và nhận Props.'}
 *    - (2) Nhận State/Props và render UI ban đầu.
 *    - (3) End-User tương tác trên component -> Cập nhật State -> Re-render màn hình.
 * ============================================================================
 */
`;
    fs.writeFileSync(file, docBlock + content, 'utf8');
});
console.log('DONE!');
