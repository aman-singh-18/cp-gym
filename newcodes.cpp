#include <bits/stdc++.h>

using namespace std;
typedef long long ll;
typedef vector<ll> vec;

const ll MOD = 998244353;

long long power(ll b, ll e)
{
    long long r = 1;
    for (; e; e /= 2, b = b * b % MOD)
        if (e & 1)
            r = r * b % MOD;
    return r;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll t;
    cin >> t;
    while (t--)
    {
        ll n, m;
        cin >> n >> m;

        vec v(m + 1);
        for (ll i = m; i >= 1; --i)
        {
            v[i] = power(m / i, n - 2);
            for (ll j = 2 * i; j <= m; j += i)
                v[i] = (v[i] - v[j] + MOD) % MOD;
        }

        ll ans = 0;
        for (ll cur = 1; cur <= m; ++cur)
        {
            if (!v[cur])
                continue;

            vec cnt(m + 1, 0);
            for (ll i = 1; i <= m; ++i)
            {
                cnt[__gcd(i, cur)]++;
            }

            ll la = 0;

            for (ll i = 2; i <= m; ++i)
            {
                if (!cnt[i])
                    continue;
                for (ll j = 2; j <= m; ++j)
                {
                    if (!cnt[j])
                        continue;
                    if (__gcd(i, j) == 1)
                    {
                        la = (la + cnt[i] * cnt[j]) % MOD;
                    }
                }
            }
            ans = (ans + v[cur] * la) % MOD;
        }
        cout << ans <<endl;
    }
    return 0;
}