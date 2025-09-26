document.addEventListener('DOMContentLoaded', function() {
    const ipBaseInput = document.getElementById('ipBaseInput');
    const ipErrorSpan = document.getElementById('ipError');
    const cidrSelect = document.getElementById('cidrSelect');
    const calcularBtn = document.getElementById('calcularBtn');
    const mascaraSubredeSpan = document.getElementById('mascaraSubrede');
    const mascaraCoringaSpan = document.getElementById('mascaraCoringa');
    const numEnderecosSpan = document.getElementById('numEnderecos');
    const ipRedeSpan = document.getElementById('ipRede');
    const ipBroadcastSpan = document.getElementById('ipBroadcast');
    const ipsUsaveisSpan = document.getElementById('ipsUsaveis');

    // Preenche o select CIDR de 0 a 32
    for (let i = 0; i <= 32; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = '/' + i;
        cidrSelect.appendChild(option);
    }

    // Função para validar um IP decimal (ex: 192.168.1.1)
    function isValidIp(ip) {
        if (!ip) return false;
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part => {
            const num = parseInt(part, 10);
            return !isNaN(num) && num >= 0 && num <= 255;
        });
    }

    // Função para converter um IP decimal para binário (32 bits)
    function ipDecimalToBinary(ipDecimal) {
        return ipDecimal.split('.').map(octeto => {
            return parseInt(octeto, 10).toString(2).padStart(8, '0');
        }).join('');
    }

    // Função para converter um IP binário para decimal
    function ipBinaryToDecimal(ipBinary) {
        let octetosBinarios = [
            ipBinary.substring(0, 8),
            ipBinary.substring(8, 16),
            ipBinary.substring(16, 24),
            ipBinary.substring(24, 32)
        ];
        return octetosBinarios.map(bin => parseInt(bin, 2)).join('.');
    }

    // Função para formatar o display dos resultados
    function clearResults() {
        mascaraSubredeSpan.textContent = '';
        mascaraCoringaSpan.textContent = '';
        numEnderecosSpan.textContent = '';
        ipRedeSpan.textContent = '';
        ipBroadcastSpan.textContent = '';
        ipsUsaveisSpan.textContent = '';
        ipErrorSpan.textContent = '';
    }

    calcularBtn.addEventListener('click', function() {
        clearResults();
        const cidr = parseInt(cidrSelect.value, 10);
        const ipBaseStr = ipBaseInput.value.trim();
        const ipBaseProvided = isValidIp(ipBaseStr);

        if (!ipBaseProvided && ipBaseStr !== "") {
            ipErrorSpan.textContent = 'IP base inválido. Por favor, use o formato X.X.X.X';
        }

        // 1. Máscara de Sub-rede
        let mascaraSubredeBits = '';
        for (let i = 0; i < 32; i++) {
            mascaraSubredeBits += (i < cidr) ? '1' : '0';
        }
        const mascaraSubredeDecimal = ipBinaryToDecimal(mascaraSubredeBits);
        mascaraSubredeSpan.textContent = mascaraSubredeDecimal;

        // 2. Máscara Coringa
        let mascaraCoringaBits = '';
        for (let i = 0; i < 32; i++) {
            mascaraCoringaBits += (i < cidr) ? '0' : '1';
        }
        const mascaraCoringaDecimal = ipBinaryToDecimal(mascaraCoringaBits);
        mascaraCoringaSpan.textContent = mascaraCoringaDecimal;

        // 3. Número de Endereços
        const numHostsBits = 32 - cidr;
        const numEnderecos = Math.pow(2, numHostsBits);
        numEnderecosSpan.textContent = numEnderecos;

        // 4. IP de Rede, IP de Broadcast e Endereços IP Usáveis (apenas se IP base for fornecido e válido)
        if (ipBaseProvided) {
            const ipBaseBinario = ipDecimalToBinary(ipBaseStr);

            // Calcular IP de Rede (AND bit a bit entre IP Base e Máscara de Sub-rede)
            let ipRedeBinario = '';
            for (let i = 0; i < 32; i++) {
                ipRedeBinario += (ipBaseBinario[i] === '1' && mascaraSubredeBits[i] === '1') ? '1' : '0';
            }
            const ipRedeDecimal = ipBinaryToDecimal(ipRedeBinario);
            ipRedeSpan.textContent = ipRedeDecimal;

            // Calcular IP de Broadcast (OR bit a bit entre IP de Rede e Máscara Coringa)
            let ipBroadcastBinario = '';
            for (let i = 0; i < 32; i++) {
                ipBroadcastBinario += (ipRedeBinario[i] === '1' || mascaraCoringaBits[i] === '1') ? '1' : '0';
            }
            const ipBroadcastDecimal = ipBinaryToDecimal(ipBroadcastBinario);
            ipBroadcastSpan.textContent = ipBroadcastDecimal;

            // Endereços IP Usáveis
            if (numEnderecos >= 2) {
                let firstUsableOctets = ipRedeDecimal.split('.').map(Number);
                let carry = 1;
                for (let i = 3; i >= 0; i--) {
                    let sum = firstUsableOctets[i] + carry;
                    firstUsableOctets[i] = sum % 256;
                    carry = Math.floor(sum / 256);
                    if (carry === 0) break;
                }
                const firstUsableIp = firstUsableOctets.join('.');

                let lastUsableOctets = ipBroadcastDecimal.split('.').map(Number);
                carry = -1;
                for (let i = 3; i >= 0; i--) {
                    let sum = lastUsableOctets[i] + carry;
                    if (sum < 0) {
                        sum += 256;
                        carry = -1;
                    } else {
                        carry = 0;
                    }
                    lastUsableOctets[i] = sum;
                    if (carry === 0) break;
                }
                const lastUsableIp = lastUsableOctets.join('.');

                ipsUsaveisSpan.textContent = `${firstUsableIp} - ${lastUsableIp}`;
            } else {
                ipsUsaveisSpan.textContent = 'Não há IPs utilizáveis (apenas Rede/Broadcast).';
            }

        } else {
            ipRedeSpan.textContent = 'IP base necessário';
            ipBroadcastSpan.textContent = 'IP base necessário';
            ipsUsaveisSpan.textContent = 'IP base necessário';
        }
    });
});